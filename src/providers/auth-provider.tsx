"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/types/user";
import { useGetMe, useLogout } from "@/lib/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: userData, isLoading: isAuthLoading } = useGetMe();
  const user = (userData as User) || null;
  const logoutMutation = useLogout();
  const isProtectedRoute = pathname !== "/login";

  useEffect(() => {
    if (isAuthLoading) return;

    if (user && !isProtectedRoute) {
      window.location.href = "/";
    } else if (!user && isProtectedRoute) {
      window.location.href = "/login";
    }
  }, [user, isAuthLoading, isProtectedRoute]);

  useEffect(() => {
    const handleAuthExpired = () => {
      queryClient.setQueryData(["auth-user"], null);
      if (pathname !== "/login") {
        window.location.href = "/login";
      }
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, [pathname, queryClient]);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      console.error("Logout failed on backend", e);
    }

    queryClient.setQueryData(["auth-user"], null);
    window.location.href = "/login";
  };

  if (isAuthLoading || (!user && isProtectedRoute)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading: isAuthLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
