import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
  return localStorage.getItem("access") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
