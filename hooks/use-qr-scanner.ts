"use client";

import jsQR from "jsqr";
import * as React from "react";

export type ScannerStatus = "starting" | "live" | "denied" | "unavailable" | "error";

type BarcodeDetectorLike = {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
};

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

type WakeLockSentinel = { release(): Promise<void> };

// Fast enough that a ticket held up for half a second is read, slow enough
// that the phone isn't decoding every frame and cooking in someone's hand.
const SCAN_INTERVAL_MS = 120;

// The QR only carries twelve characters, so a downscaled frame decodes it
// just as reliably and several times faster than a 1280px one.
const DECODE_WIDTH = 640;

/**
 * Chrome on Android has a hardware-backed detector; Safari has none, and
 * that's most of the phones a church hands its door staff. So: use the
 * native one where it exists, and fall back to decoding in JS everywhere
 * else rather than shipping a scanner that only half the team can run.
 */
function createDetector(): BarcodeDetectorLike | null {
  const ctor = (globalThis as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  if (!ctor) return null;

  try {
    return new ctor({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

export function useQrScanner({
  onDecode,
  paused = false,
}: {
  onDecode: (text: string) => void;
  paused?: boolean;
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const detectorRef = React.useRef<BarcodeDetectorLike | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const lastFrameAt = React.useRef(0);

  // Read inside the decode loop so pausing after a scan doesn't tear the
  // camera down and make the staff wait for it to warm up again.
  const pausedRef = React.useRef(paused);
  const decodeRef = React.useRef(onDecode);

  const [status, setStatus] = React.useState<ScannerStatus>("starting");
  const [torchAvailable, setTorchAvailable] = React.useState(false);
  const [insecure, setInsecure] = React.useState(false);
  const [torchOn, setTorchOn] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

  React.useEffect(() => {
    pausedRef.current = paused;
    decodeRef.current = onDecode;
  });

  React.useEffect(() => {
    let cancelled = false;
    let decoding = false;

    async function readFrame(video: HTMLVideoElement): Promise<string | null> {
      const detector = detectorRef.current;

      if (detector) {
        const codes = await detector.detect(video);
        return codes[0]?.rawValue ?? null;
      }

      const canvas = (canvasRef.current ??= document.createElement("canvas"));
      const scale = Math.min(1, DECODE_WIDTH / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return null;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);

      return (
        jsQR(frame.data, frame.width, frame.height, { inversionAttempts: "dontInvert" })
          ?.data ?? null
      );
    }

    async function tick(now: number) {
      frameRef.current = requestAnimationFrame(tick);

      if (cancelled || decoding || pausedRef.current) return;
      if (now - lastFrameAt.current < SCAN_INTERVAL_MS) return;
      lastFrameAt.current = now;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      decoding = true;
      try {
        const text = await readFrame(video);
        if (text && !cancelled && !pausedRef.current) decodeRef.current(text);
      } catch {
        // Some Android builds have a detector that throws partway through a
        // session. Drop to the JS decoder for the rest of it instead of
        // leaving the door with a dead camera.
        detectorRef.current = null;
      } finally {
        decoding = false;
      }
    }

    async function start() {
      const media = navigator.mediaDevices;

      // Browsers only hand out a camera over https (or localhost), and a
      // dev server opened by LAN IP fails here with no explanation of its
      // own — which is exactly how staff will first try this on a phone.
      if (!window.isSecureContext) {
        setInsecure(true);
        setStatus("unavailable");
        return;
      }

      if (!media?.getUserMedia) {
        setStatus("unavailable");
        return;
      }

      setStatus("starting");

      let stream: MediaStream;
      try {
        stream = await media.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (error) {
        const name = (error as { name?: string } | null)?.name;
        setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        setStatus("error");
        return;
      }

      video.srcObject = stream;
      await video.play().catch(() => {});

      const capabilities = stream.getVideoTracks()[0]?.getCapabilities?.() as
        | { torch?: boolean }
        | undefined;
      setTorchAvailable(Boolean(capabilities?.torch));
      setTorchOn(false);

      detectorRef.current = createDetector();
      setStatus("live");
      frameRef.current = requestAnimationFrame(tick);
    }

    void start();

    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [attempt]);

  // Coming back from another app (or a locked screen) often returns a track
  // the OS has already ended — which looks exactly like a frozen picture.
  React.useEffect(() => {
    function onVisibility() {
      if (document.visibilityState !== "visible") return;
      const track = streamRef.current?.getVideoTracks()[0];
      if (!track || track.readyState !== "live") retry();
      else void videoRef.current?.play().catch(() => {});
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [retry]);

  React.useEffect(() => {
    const lock = (
      navigator as Navigator & {
        wakeLock?: { request(type: "screen"): Promise<WakeLockSentinel> };
      }
    ).wakeLock;

    if (!lock) return;

    let sentinel: WakeLockSentinel | null = null;
    let released = false;

    async function acquire() {
      try {
        const next = await lock!.request("screen");
        if (released) void next.release().catch(() => {});
        else sentinel = next;
      } catch {
        // Denied or unsupported — the screen just dims as usual.
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") void acquire();
    }

    void acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, []);

  const toggleTorch = React.useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    const next = !torchOn;
    try {
      // `torch` is real on Android but absent from the DOM typings.
      await track.applyConstraints({ advanced: [{ torch: next }] } as unknown as MediaTrackConstraints);
      setTorchOn(next);
    } catch {
      setTorchAvailable(false);
    }
  }, [torchOn]);

  return { videoRef, status, insecure, retry, torchAvailable, torchOn, toggleTorch };
}
