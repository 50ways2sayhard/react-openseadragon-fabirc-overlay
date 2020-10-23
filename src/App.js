import React, { createContext, useReducer } from "react";
import "./App.scss";
import Viewer from "./components/viewer";
import reducer, { initialState } from "./reducer";

export const StateContext = createContext();
const StateProvider = ({ reducer, initialState, children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);

const annos = [
  {
    key: 1,
    strokeColor: "red",
    title: "anno1",
    points: [
      [1000, 1000],
      [1350, 1000],
      [1350, 1350],
      [1000, 1350],
    ],
  },
  {
    key: 2,
    strokeColor: "blue",
    strokeWidth: 2,
    title: "anno2",
    points: [
      [74, 104],
      [75, 106],
      [83, 113],
      [120, 115],
      [126, 111],
      [127, 106],
      [129, 101],
      [129, 96],
      [129, 93],
      [129, 88],
      [129, 84],
      [124, 78],
      [122, 77],
      [118, 75],
      [117, 75],
      [115, 75],
      [109, 75],
      [103, 75],
      [98, 77],
      [94, 81],
      [87, 85],
      [82, 88],
      [76, 94],
    ],
  },
];

function App() {
  return (
    <div className="App">
      <StateProvider reducer={reducer} initialState={initialState}>
        <Viewer
          server="http://localhost/api/deepzoom/"
          tileName="09181626_12.TMAP"
          overlays={annos}
          overlayClasses={["LSIL", "HSIL"]}
        />
      </StateProvider>
    </div>
  );
}

export default App;
