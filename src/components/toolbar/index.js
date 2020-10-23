import React from "react";
import useOpenSeadragon from "../../hooks/useOpenSeaDragon";
import "./style.scss";

export default function Toolbar() {
  const { state, zoomTo, drawOverlay, removeOverlay } = useOpenSeadragon();
  return (
    <div className="osd-toolbar-container">
      <button className="circle-btn" onClick={() => zoomTo(2)}>
        2
      </button>
      <button onClick={() => zoomTo(4)}>4x</button>
      <button onClick={() => zoomTo(10)}>10x</button>
      <button onClick={() => zoomTo(20)}>20x</button>
      <button onClick={() => drawOverlay()}>draw</button>

      <span style={{ display: "flex", flexDirection: "column" }}>
        <div>Zoom Level</div>
        <div>{state.zoom && state.zoom.toFixed(2)}</div>
      </span>
      <div>
        {state.overlays.map((ov) => {
          return (
            <div key={ov.key}>
              <span>{ov.key}</span>
              <button
                onClick={() => {
                  removeOverlay(ov);
                }}
              >
                -
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
