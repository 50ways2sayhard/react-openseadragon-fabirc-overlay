export const initialState = {
  zoom: 0,
  overlays: [],
  drawingMode: false,
  tileInfo: {},
  showDrawModal: false,
  cachedOverlay: null,
  currSelectedClass: "annotation",
  autoSubmitCachedOverlay: false,
  mousePos: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "zoom":
      return { ...state, zoom: action.zoom };
    case "load-tileInfo":
      return { ...state, tileInfo: action.tileInfo };
    case "add-overlays":
      return { ...state, overlays: state.overlays.concat(action.overlays) };
    case "remove-overlay":
      return {
        ...state,
        overlays: state.overlays.filter((ov) => ov.key !== action.overlay.key),
      };
    case "add-cached-overlay":
      return { ...state, cachedOverlay: action.cachedOverlay };
    case "update-cached-overlay":
      return {
        ...state,
        cachedOverlay: { ...state.cachedOverlay, ...action.update },
      };
    case "clear-cached-overlay":
      return { ...state, cachedOverlay: initialState.cachedOverlay };
    case "clear-overlays":
      return { ...state, overlays: [] };
    case "drawing-mode":
      return { ...state, drawingMode: action.toggle };
    case "draw-done-modal":
      return { ...state, showDrawModal: action.show };
    case "curr-selected-class":
      return { ...state, currSelectedClass: action.currSelectedClass };
    case "auto-submit-cached-overlay-mode":
      return {
        ...state,
        autoSubmitCachedOverlay: action.toggle,
      };
    case "mouse-position":
      return { ...state, mousePos: action.mousePos };
    default:
      return state;
  }
}
