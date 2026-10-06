// A drawn fingerprint — the conference's name, and the logo's own motif —
// built from nested, broken loops so it reads as ridges rather than as a
// target. Shared by the invite page and its share card so they match.

export const RIDGE_VIEWBOX = { width: 200, height: 240 };

function point(cx: number, cy: number, rx: number, ry: number, deg: number): string {
  const rad = (deg * Math.PI) / 180;
  return `${(cx + rx * Math.cos(rad)).toFixed(1)} ${(cy + ry * Math.sin(rad)).toFixed(1)}`;
}

export function fingerprintRidges(count = 12): string[] {
  const cx = 100;
  const cy = 118;
  const paths: string[] = [];

  for (let i = 0; i < count; i++) {
    const rx = 9 + i * 8;
    const ry = rx * 1.3;
    // Each ridge breaks somewhere else, the way real ones end and fork.
    const gapAt = (215 + i * 53) % 360;
    const gap = Math.max(14, 34 - i * 1.5);
    const from = gapAt + gap / 2;
    const to = gapAt - gap / 2 + 360;
    paths.push(`M ${point(cx, cy, rx, ry, from)} A ${rx} ${ry} 0 1 1 ${point(cx, cy, rx, ry, to)}`);
  }

  // The core: a short hooked ridge in the middle.
  paths.push(`M ${cx - 4} ${cy + 6} C ${cx - 4} ${cy - 8}, ${cx + 6} ${cy - 8}, ${cx + 5} ${cy + 2}`);
  return paths;
}

export function fingerprintSvg(color: string, strokeWidth = 3.2): string {
  const paths = fingerprintRidges()
    .map((d) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${RIDGE_VIEWBOX.width} ${RIDGE_VIEWBOX.height}">${paths}</svg>`;
}
