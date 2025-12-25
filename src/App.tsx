import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Diagnosis from "./Diagnosis";
import Forum from "./Forum";
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

        <Route
          path="/Forum"
          element={
            <AuthGate>
              <Forum />
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
