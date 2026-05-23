import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRole?: "admin" | "student";
}

const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { isAuth, role } = useAuth();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

 if (allowedRole && role !== allowedRole) {
  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "student") {
    const lastPath = localStorage.getItem("lastPath") || "/dashboard";
    return <Navigate to={lastPath} replace />;
  }
}

  return <Outlet />;
};

export default ProtectedRoute;
