import usePanZoom from "use-pan-and-zoom";

export default function App() {
  const {
    transform,
    panZoomHandlers,
    setContainer,
    setPan,
    setZoom
  } = usePanZoom();

  return (
    <div className="container">
      <div className="actions">
        <button onClick={() => setPan({ x: 0, y: 0 })}>Reset pan</button>
        <button onClick={() => setZoom(1)}>Reset zoom</button>
      </div>
      <div
        ref={(el) => setContainer(el)}
        className="outer"
        {...panZoomHandlers}
      >
        <div className="inner" style={{ transform }}>
          <p>
            Drag to{" "}
            <span role="img" aria-label="pan">
              👆
            </span>{" "}
            and scroll / pinch to{" "}
            <span role="img" aria-label="zoom">
              🔎
            </span>
          </p>
          <div style={{ top: 100, left: 100 }} className="shape blue square" />
          <div style={{ top: 100, right: 100 }} className="shape red circle" />
          <div
            style={{ bottom: 100, left: 100 }}
            className="shape blue circle"
          />
          <div
            style={{ bottom: 100, right: 100 }}
            className="shape red square"
          />
        </div>
      </div>
    </div>
  );
}
