import { Navigate } from "react-router";

function RottaProtetta({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
export default RottaProtetta;
