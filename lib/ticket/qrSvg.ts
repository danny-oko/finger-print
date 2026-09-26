import QRCode from "qrcode";

export const QR_DOT_RADIUS = 0.45;
export const QR_QUIET_ZONE = 2;

export type QrShapes = {
  // Width/height of the square viewBox, quiet zone included.
  extent: number;
  modules: string;
  // Rings and centres of the three finder patterns; draw with fill-rule="evenodd".
  finders: string;
};

const FINDER = 7;

function inFinder(size: number, row: number, col: number) {
  const top = row < FINDER;
  const left = col < FINDER;
  const right = col >= size - FINDER;
  const bottom = row >= size - FINDER;
  return (top && left) || (top && right) || (bottom && left);
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

// Both subpaths wind clockwise, so overlapping dots and bridges union under
// the default nonzero fill rule instead of punching holes in each other.
function circle(cx: number, cy: number, r: number) {
  return `M${round(cx - r)} ${round(cy)}a${r} ${r} 0 1 1 ${round(2 * r)} 0a${r} ${r} 0 1 1 ${round(-2 * r)} 0Z`;
}

function rect(x: number, y: number, w: number, h: number) {
  return `M${round(x)} ${round(y)}h${round(w)}v${round(h)}h${round(-w)}Z`;
}

export function qrShapes(text: string, quiet = QR_QUIET_ZONE): QrShapes {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "Q" });
  const size = modules.size;
  const r = QR_DOT_RADIUS;

  const dark = (row: number, col: number) =>
    row >= 0 &&
    col >= 0 &&
    row < size &&
    col < size &&
    !inFinder(size, row, col) &&
    Boolean(modules.get(row, col));

  const parts: string[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!dark(row, col)) continue;

      const cx = quiet + col + 0.5;
      const cy = quiet + row + 0.5;
      parts.push(circle(cx, cy, r));

      // Neighbours are joined into pills, the way the printed card draws them.
      if (dark(row, col + 1)) parts.push(rect(cx, cy - r, 1, 2 * r));
      if (dark(row + 1, col)) parts.push(rect(cx - r, cy, 2 * r, 1));
      // Plugs the pinhole a pill-joined 2×2 block would otherwise leave.
      if (dark(row, col + 1) && dark(row + 1, col) && dark(row + 1, col + 1)) {
        parts.push(rect(cx, cy, 1, 1));
      }
    }
  }

  const finders = [
    [0, 0],
    [0, size - FINDER],
    [size - FINDER, 0],
  ]
    .map(([row, col]) => {
      const cx = quiet + col + FINDER / 2;
      const cy = quiet + row + FINDER / 2;
      // Outer ring 1 module thick, 1 module gap, 3-module centre: the
      // 1:1:3:1:1 run decoders look for survives through the middle.
      return circle(cx, cy, 3.5) + circle(cx, cy, 2.5) + circle(cx, cy, 1.5);
    })
    .join("");

  return { extent: size + quiet * 2, modules: parts.join(""), finders };
}

export function qrSvgMarkup(
  text: string,
  { color = "#000", background }: { color?: string; background?: string } = {},
): string {
  const { extent, modules, finders } = qrShapes(text);
  const bg = background
    ? `<rect width="${extent}" height="${extent}" fill="${background}"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${extent} ${extent}">${bg}<path fill="${color}" d="${modules}"/><path fill="${color}" fill-rule="evenodd" d="${finders}"/></svg>`;
}
