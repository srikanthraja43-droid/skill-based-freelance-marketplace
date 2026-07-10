import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth, selectRole } from "../../features/auth/authSlice";

export default function ProtectedRoute({ children, roles }) {
  const isAuth = useSelector(selectIsAuth);
  const role = useSelector(selectRole);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}
