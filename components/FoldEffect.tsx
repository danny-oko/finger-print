"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Props = {
  className?: string;
};

export default function FoldEffect({ className }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;

    const centerContent = root.querySelector<HTMLElement>("#center-content");
    const centerFold = root.querySelector<HTMLElement>("#center-fold");
    const foldsContent = Array.from(
      root.querySelectorAll<HTMLElement>(".fold-content"),
    );
    if (!centerContent || !centerFold || foldsContent.length === 0) return;

    const marquees = Array.from(root.querySelectorAll<HTMLElement>(".marquee"));
    const triggers: ScrollTrigger[] = [];

    marquees.forEach((el, index) => {
      const track = el.querySelector<HTMLElement>(".track");
      if (!track) return;

      const [x, xEnd] = index % 2 === 0 ? [-500, -1500] : [-500, 0];

      const tween = gsap.fromTo(
        track,
        { x },
        {
          x: xEnd,
          ease: "none",
          scrollTrigger: { scrub: 1 },
        },
      );

      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    let targetScroll = -window.scrollY;
    let currentScroll = targetScroll;

    const tick = () => {
      const overflowHeight =
        centerContent.clientHeight - centerFold.clientHeight;

      document.body.style.height = `${overflowHeight + window.innerHeight}px`;

      targetScroll = -window.scrollY;
      currentScroll += (targetScroll - currentScroll) * 0.1;

      for (const content of foldsContent) {
        content.style.transform = `translateY(${currentScroll}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      triggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={rootRef} id="fold-effect" className={className}>
      <div className="wrapper-3d z-100">
        <div className="fold fold-top">
          <div className="fold-align">
            <div className="fold-content">{Rows()}</div>
          </div>
        </div>

        <div className="fold fold-center" id="center-fold">
          <div className="fold-align">
            <div className="fold-content" id="center-content">
              {Rows()}
            </div>
          </div>
        </div>

        <div className="fold fold-bottom">
          <div className="fold-align">
            <div className="fold-content">{Rows()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rows() {
  return (
    <>
      <div className="marquee">
        <div className="track">
          Fingerprint. Fingerprint. Fingerprint.
          <span className="-focus">Creators.</span>
          Fingerprint. Fingerprint. Fingerprint. Fingerprint. Fingerprint.
        </div>
      </div>
      <div className="marquee">
        <div className="track">
          Represent. Unique.<span className="-focus">Identity.</span>
          represents the unique identity of every young person
        </div>
      </div>
      <div className="marquee">
        <div className="track">
          Encourage. Trust.
          <span className="-focus"> Discover.</span>
          Encouraging them to Discover, Trust
        </div>
      </div>
      <div className="marquee">
        <div className="track">
          Grow. God-Driven. Value.
          <span className="-focus">God-Driven Value.</span>
          Grow in their God-given value.
        </div>
      </div>
    </>
  );
}
