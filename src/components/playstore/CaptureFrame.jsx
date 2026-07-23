// CaptureFrame — renders children inside an exact 1080×1920 phone canvas.
// The app UI is authored mobile-first, so content is laid out at a logical
// mobile width (412px) and scaled up to fill the 1080px-wide canvas. This mirrors
// what a real Android screenshot at 1080×1920 device pixels looks like.
//
// frameScale scales the whole 1080×1920 canvas (e.g. 0.28 for workspace previews).

const LOGICAL_W = 412;
const SCALE = 1080 / LOGICAL_W; // ≈ 2.6214
const INNER_H = Math.ceil(1920 / SCALE);

export default function CaptureFrame({ children, frameScale = 1 }) {
  return (
    <div style={{ width: 1080 * frameScale, height: 1920 * frameScale, overflow: "hidden", flexShrink: 0 }}>
      <div
        style={{
          width: 1080, height: 1920, background: "#0a0c14",
          position: "relative", overflow: "hidden",
          transform: `scale(${frameScale})`, transformOrigin: "top left",
        }}
      >
        <div
          className="scrollbar-hide"
          style={{
            width: LOGICAL_W, height: INNER_H,
            overflowY: "auto", overflowX: "hidden",
            transform: `scale(${SCALE})`, transformOrigin: "top left",
            position: "absolute", top: 0, left: 0,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}