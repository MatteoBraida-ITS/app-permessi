import Login from "@/pages/Login";
import Registrazione from "@/pages/Registrazione";
import { Navigate, Routes, Route } from "react-router";
import RottaProtetta from "@/components/RottaProtetta";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/registrazione" element={<Registrazione />}></Route>
      <Route path="/" element={<Navigate to="/login" replace />}></Route>
      <Route
        element={
          <RottaProtetta>
            <Layout />
          </RottaProtetta>
        }
      >
        <Route path="/home" element={<Home />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
