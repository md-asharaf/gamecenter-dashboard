"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userData, isLoading: isAuthLoading } = useGetMe();
  const user = (userData as User) || null;
  const logoutMutation = useLogout();
  const isProtectedRoute = pathname !== "/login";

  useEffect(() => {
    if (isAuthLoading) return;

    if (user && !isProtectedRoute) {
      router.replace("/");
    } else if (!user && isProtectedRoute) {
      let currentPath = pathname;
      if (typeof window !== 'undefined') {
        currentPath = window.location.pathname + window.location.search;
      }
      const callbackUrl = encodeURIComponent(currentPath);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [user, isAuthLoading, isProtectedRoute, router, pathname]);

  useEffect(() => {
    const handleAuthExpired = () => {
      queryClient.setQueryData(["auth-user"], null);
      if (window.location.pathname !== "/login") {
        const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.replace(`/login?callbackUrl=${callbackUrl}`);
      }
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, [queryClient, router]);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      console.error("Logout failed on backend", e);
    }

    queryClient.setQueryData(["auth-user"], null);
    router.replace("/login");
    
    setTimeout(() => {
      queryClient.removeQueries();
    }, 100);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isAuthLoading, logout }}>
      {(isAuthLoading || (!user && isProtectedRoute)) && (
        <div className="fixed inset-0 z-[100] flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">
              {logoutMutation.isPending ? "Logging out..." : "Please wait..."}
            </p>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
