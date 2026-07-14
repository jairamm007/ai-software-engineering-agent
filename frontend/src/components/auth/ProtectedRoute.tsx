import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
