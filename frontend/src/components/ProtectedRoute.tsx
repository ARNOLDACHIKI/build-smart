import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { resolveHomeRoute, type AppRole } from "@/lib/roles";

type ProtectedRouteProps = {
  children: JSX.Element;
  requireAdmin?: boolean;
  allowedRoles?: AppRole[];
};

const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isHydrating, user } = useAuth();

  if (isHydrating) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== "ADMIN") {
    return <Navigate to={resolveHomeRoute(user?.role)} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to={resolveHomeRoute(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
