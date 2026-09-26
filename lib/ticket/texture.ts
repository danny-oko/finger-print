export const TICKET_GRADIENT =
  "linear-gradient(135deg, #F39A0C 0%, #F3890C 22%, #E97110 55%, #E25218 100%)";

export const TICKET_GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>",
)}")`;
