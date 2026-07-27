import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Verifying admin access...</p>
        </div>
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
