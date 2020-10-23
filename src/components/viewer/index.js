import PropTypes from "prop-types";
import React, { useEffect } from "react";
import useOpenSeadragon from "../../hooks/useOpenSeaDragon";
import Modal from "../modal";
import Navigator from "../navigator";
import Toolbar from "../toolbar";

export default function Viewer({ server, tileName, overlays, overlayClasses }) {
  const {
    init,
    open,
    destroy,
    addOverlays,
    state,
    updateCachedOverlay,
    submitCachedOverlay,
    updateCurrSelectedClass,
    toggleMode,
  } = useOpenSeadragon();

  useEffect(() => {
    init();
    open(server, tileName);
    addOverlays(overlays);
    if (overlayClasses.length) {
      updateCurrSelectedClass(overlayClasses[0]);
    } else {
      toggleMode("auto-submit-cached-overlay-mode", true);
    }
    return () => {
      destroy();
    };
  }, [server, tileName]);

  return (
    <>
      <Navigator />
      <div id="openseadragon-viewer" style={{ height: "95vh" }}></div>
      <Toolbar />

      {overlayClasses.length ? (
        <Modal show={state.showDrawModal} position={state.mousePos}>
          <select
            onChange={(e) => {
              updateCurrSelectedClass(e.target.value);
              updateCachedOverlay({ title: e.target.value });
            }}
          >
            {overlayClasses.map((cls) => (
              <option value={cls} key={cls}>
                {cls}
              </option>
            ))}
          </select>
          <button onClick={submitCachedOverlay}>submit</button>
        </Modal>
      ) : (
        ""
      )}
    </>
  );
}

Viewer.propTypes = {
  server: PropTypes.string,
  tileName: PropTypes.string,
  overlays: PropTypes.array,
  overlayClasses: PropTypes.array,
};

Viewer.defaultProps = {
  overlays: [],
  overlayClasses: [],
};
