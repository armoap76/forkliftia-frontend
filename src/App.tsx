import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Diagnosis from "./Diagnosis";
import { AuthGate } from "./AuthGate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/diagnosis"
          element={
            <AuthGate>
              <Diagnosis />
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;