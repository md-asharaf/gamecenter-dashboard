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
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: userData, isLoading: isAuthLoading } = useGetMe();
  const user = (userData as User) || null;
  const logoutMutation = useLogout();

  const isProtectedRoute = pathname !== "/login";
  const isNavigating = 
    (!isAuthLoading && isProtectedRoute && !user) || 
    (!isAuthLoading && !isProtectedRoute && user);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user && !isProtectedRoute) {
      router.push("/");
    } else if (!user && isProtectedRoute) {
      router.push("/login");
    }
  }, [user, isAuthLoading, isProtectedRoute, router]);

  useEffect(() => {
    const handleAuthExpired = () => {
      queryClient.removeQueries({ queryKey: ["auth-user"] });
      if (pathname !== "/login") {
        router.push("/login");
      }
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, [pathname, router, queryClient]);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      console.error("Logout failed on backend", e);
    }

    queryClient.removeQueries({ queryKey: ["auth-user"] });
    router.push("/login");
  };

  if (isAuthLoading || isNavigating) {
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
