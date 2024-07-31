import React from 'react';
import './App.css';
import Video from './components/Video';

function App() {
  return (
    <div className="App">
      <Video autoPlay={true} />
    </div>
  );
}

export default App;
