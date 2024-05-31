import React from "react";
import "./App.css";
import Video from "./components/Video";

function App() {
  return (
    <div className="App">
      <Video width={480} height={(480 * 3) / 4}></Video>
      video 연결
    </div>
  );
}

export default App;
