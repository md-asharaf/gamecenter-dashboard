"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/types/user";
import { useGetMe, useLogout } from "@/lib/hooks/use-auth";
import { Loader2, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isServerError, getErrorMessage } from "@/lib/api/api-error";

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

  const { data: userData, isLoading: isAuthLoading, error } = useGetMe();
  const serverErrorOccurred = isServerError(error);
  const errorMessage = getErrorMessage(error, "We couldn't reach the server. This could be due to a temporary outage or network issue.");
  const user = userData || null;
  const logoutMutation = useLogout();
  const isProtectedRoute = pathname !== "/login";

  useEffect(() => {
    if (isAuthLoading) return;

    if (user && !isProtectedRoute) {
      router.replace("/");
    } else if (!user && !serverErrorOccurred && isProtectedRoute) {
      let currentPath = pathname;
      if (typeof window !== 'undefined') {
        currentPath = window.location.pathname + window.location.search;
      }
      const callbackUrl = encodeURIComponent(currentPath);
      router.replace(`/login?callbackUrl=${callbackUrl}&clear_session=true`);
    }
  }, [user, isAuthLoading, serverErrorOccurred, isProtectedRoute, router, pathname]);

  useEffect(() => {
    const handleAuthExpired = () => {
      queryClient.setQueryData(["auth-user"], null);
      if (window.location.pathname !== "/login") {
        const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.replace(`/login?callbackUrl=${callbackUrl}&clear_session=true`);
      } else {
        router.replace(`/login?clear_session=true`);
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
    router.replace("/login?clear_session=true");

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
      {serverErrorOccurred && !user && isProtectedRoute && (
        <div className="fixed inset-0 z-[100] flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 text-center p-4">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <ServerCrash className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold">Server Connection Error</h2>
            <p className="text-muted-foreground max-w-md">
              {errorMessage}
            </p>
            <Button onClick={() => window.location.reload()}>Retry Connection</Button>
          </div>
        </div>
      )}
      {!serverErrorOccurred && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
