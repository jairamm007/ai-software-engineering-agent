import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface Props {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingIndicator size="lg" label="Verifying admin access" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return <>{children}</>;
}
