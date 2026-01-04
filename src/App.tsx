import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Diagnosis from "./Diagnosis";
import Forum from "./Forum";
import ForumCaseDetail from "./ForumCaseDetail";
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

        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/cases/:caseId" element={<ForumCaseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
