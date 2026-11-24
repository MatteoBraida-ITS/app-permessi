import Login from "@/pages/Login";
import Registrazione from "@/pages/Registrazione";
import { Navigate, Routes, Route } from "react-router";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/registrazione" element={<Registrazione />}></Route>
      <Route path="/" element={<Navigate to="/login" replace />}></Route>
    </Routes>
  );
}

export default App;
