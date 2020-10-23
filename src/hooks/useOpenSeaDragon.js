import axios from "axios";
import {
    fabric,
    initOverlay,
    OpenSeadragon
} from "openseadragon-fabricjs-overlay";
import { useCallback, useContext, useRef } from "react";
import { StateContext } from "../App";

let openSeadragon = null;
let overlay = null;

export default function useOpenSeadragon() {
  const [state, dispatch] = useContext(StateContext);
  const stateRef = useRef(null);
  stateRef.current = state;

  const init = useCallback(() => {
    if (openSeadragon) return;
    initOverlay(OpenSeadragon, fabric);
    openSeadragon = OpenSeadragon({
      id: "openseadragon-viewer",
      showNavigatorControl: false,
      clickToZoom: "false",
      gestureSettingsMouse: {
        clickToZoom: false,
      },
      preserveImageSizeOnResize: true,
      defaultZoomLevel: 0,
      minZoomLevel: 0,
      zoomPerScroll: 1.3,
      visibilityRatio: 0.5,
      maxZoomPixelRatio: 4,
      zoomInButton: "zoom-in",
      maxZoomLevel: 0.002099737532808399, // 80
      showNavigator: true,
      navigatorId: "openseadragon-viewer-navigator",
    });
    overlay = openSeadragon.fabricjsOverlay({ scale: 1 });
    overlay.fabricCanvas().freeDrawingBrush.color = "black";
    overlay.fabricCanvas().freeDrawingBrush.width = 2;
    openSeadragon.addHandler("zoom", (e) => {
      dispatch({
        type: "zoom",
        zoom: openSeadragon.viewport.viewportToImageZoom(e.zoom * 20),
      });
    });
    openSeadragon.addHandler("open", () => {
      overlay.fabricCanvas().clear();
      _addOverlays(stateRef.current.overlays, overlay.fabricCanvas());
    });

    overlay.fabricCanvas().on("mouse:down", function () {
      if (stateRef.current.drawingMode) {
        _startDrawingMode(overlay.fabricCanvas());
      }
    });
  }, [dispatch]);

  const open = (server, filename) => {
    axios({
      url: server + "load",
      method: "POST",
      data: { filename },
      headers: { "Content-Type": "application/json" },
    }).then((resp) => {
      _open(resp.data);
    });
  };

  const zoomTo = useCallback(
    (zoom) => {
      zoom = parseInt(zoom) > 80 ? 80 : zoom;
      const actualZoom = openSeadragon.viewport.imageToViewportZoom(
        zoom * 0.05
      );
      openSeadragon.viewport.zoomTo(actualZoom);
      dispatch({ type: "zoom", zoom });
    },
    [dispatch]
  );

  const addOverlays = useCallback(
    (overlays, sync = false) => {
      dispatch({ type: "add-overlays", overlays });
      if (sync) _addOverlays(overlays, overlay.fabricCanvas());
    },
    [dispatch]
  );

  const drawOverlay = useCallback(() => {
    overlay.fabricCanvas().isDrawingMode = true;
    toggleMode('drawing-mode', true);
  }, [dispatch]);

  const destroy = useCallback(() => {
    openSeadragon.destroy();
    openSeadragon.close();
    openSeadragon = null;

    dispatch({ type: "clear-overlays" });
    overlay.fabricCanvas().dispose();
    overlay = null;
  }, [dispatch]);

  const removeOverlay = useCallback(
    (ov) => {
      dispatch({ type: "remove-overlay", overlay: ov });
      overlay
        .fabricCanvas()
        .getObjects()
        .filter((o) => o.key === ov.key)
        .map((o) => o.remove());
    },
    [dispatch]
  );

  const updateCachedOverlay = useCallback(
    (update) => {
      dispatch({ type: "update-cached-overlay", update });
    },
    [dispatch]
  );

  const submitCachedOverlay = useCallback(
    () => {
      addOverlays([stateRef.current.cachedOverlay], true);
      overlay
        .fabricCanvas()
        .remove(...overlay.fabricCanvas().getObjects("path"));
      dispatch({ type: "clear-cached-overlay" });
      dispatch({ type: "draw-done-modal", show: false });
    },
    [dispatch]
  );

  const updateCurrSelectedClass = useCallback(
    (cls) => {
      dispatch({ type: "curr-selected-class", currSelectedClass: cls });
    },
    [dispatch]
  );

  const toggleMode = useCallback(
    (mode, s) => {
      dispatch({ type: mode, toggle: s });
    },
    [dispatch]
  );

  const _addOverlays = (overlays, canvas) => {
    overlays.forEach((ov) => {
      let top = stateRef.current.tileInfo.dimensions;
      const points = ov.points.map((p) => {
        const point = openSeadragon.viewport.imageToViewportCoordinates(...p);
        top = [Math.min(point.x, top[0]), Math.min(point.y, top[1])];
        return point;
      });
      const shape = new fabric.Polygon(points, {
        fill: "rgba(0, 0, 0, 0)",
        strokeWidth: ov.strokeWidth || 8,
        stroke: ov.strokeColor,
        editable: false,
        selectable: false,
        evented: false,
      });
      shape.key = ov.key;
      canvas.add(shape);
      const text = new fabric.Text(ov.title, {
        left: shape.left,
        top: shape.top - 10,
        fontSize: 14,
        fill: "rgba(0,0,0,1)",
        backgroundColor: "rgba(214,214,214,0.8)",
        falseClearCache: true,
        editable: false,
        selectable: false,
        evented: false,
      });
      canvas.add(text);
      const navigatorOverlay = _addNavigatorOverlay(
        openSeadragon.navigator,
        openSeadragon.viewport,
        shape
      );
      shape.on("removed", function () {
        openSeadragon.navigator.removeOverlay(navigatorOverlay);
        text.remove();
      });
    });
  };

  const _addNavigatorOverlay = (navigator, viewport, shape) => {
    const div = document.createElement("div");
    div.style.border = "2px solid";
    div.style.borderColor = shape.stroke;
    div.style.zIndex = 2;
    div.style.cursor = "pointer";

    const x = shape.aCoords.br.x - shape.aCoords.tl.x;
    const y = shape.aCoords.br.y - shape.aCoords.tl.y;

    navigator.addOverlay(
      div,
      viewport.imageToViewportRectangle(
        shape.aCoords.tl.x,
        shape.aCoords.tl.y,
        x,
        y
      )
    );

    div.onclick = function (e) {
      zoomTo(15);
      viewport.panTo(
        new OpenSeadragon.Point(
          shape.aCoords.tl.x + x / 2,
          shape.aCoords.tl.y + y / 2
        )
      );
    };
    return div;
  };

  const _open = useCallback(
    (tileInfo) => {
      openSeadragon.open({
        width: tileInfo.dimensions[0],
        tileSource: "http://localhost" + tileInfo.slide_url,
        pixelPerMeter: tileInfo.slide_mpp ? 1e6 / tileInfo.slide_mpp : 0,
      });
      dispatch({ type: "load-tileInfo", tileInfo });
    },
    [dispatch]
  );

  const _startDrawingMode = useCallback(
    (canvas) => {
      const points = [];
      openSeadragon.setMouseNavEnabled(false);
      openSeadragon.outerTracker.setTracking(false);

      const recordPts = (event) => {
        const ptr = canvas.getPointer(event.e);
        points.push([ptr.x, ptr.y]);
      };

      const stopRecordPts = (event) => {
        canvas.off("mouse:move", recordPts);
        canvas.off("mouse:up", stopRecordPts);
        openSeadragon.setMouseNavEnabled(true);
        openSeadragon.outerTracker.setTracking(true);
        canvas.isDrawingMode = false;
        const id = stateRef.current.overlays.length + 1;

        const ol = {
          key: id,
          strokeColor: "green",
          strokeWidth: 2,
          title: stateRef.current.currSelectedClass,
          points,
        };

        dispatch({ type: "draw-done-modal", show: true });
        dispatch({ type: "add-cached-overlay", cachedOverlay: ol });
        dispatch({
          type: "mouse-position",
          mousePos: [event.e.clientX, event.e.clientY],
        });
        if (stateRef.current.autoSubmitCachedOverlay) submitCachedOverlay();

        toggleMode('drawing-mode', false);
      };

      canvas.on("mouse:move", recordPts);
      canvas.on("mouse:up", stopRecordPts);
    },
    [dispatch]
  );

  return {
    init,
    open,
    destroy,
    state,
    zoomTo,
    addOverlays,
    drawOverlay,
    removeOverlay,
    updateCachedOverlay,
    submitCachedOverlay,
    updateCurrSelectedClass,
    toggleMode,
  };
}
