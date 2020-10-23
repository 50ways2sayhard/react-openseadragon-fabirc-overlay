import React from "react";

export default function Navigator() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 294,
        width: 294,
        zIndex: 1,
      }}
    >
      <div
        id="openseadragon-viewer-navigator"
        style={{ height: 294, width: 294 }}
      />
    </div>
  );
}
