import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Diagnosis from "./Diagnosis";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/diagnosis" element={<Diagnosis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

