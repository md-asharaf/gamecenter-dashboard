"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: userData, isLoading } = useGetMe();
  const user = (userData?.data as User) || null;
  const logoutMutation = useLogout();

  useEffect(() => {
    if (isLoading) return;

    if (user && pathname === "/login") {
      setTimeout(() => setIsRedirecting(true), 0);
      router.push("/");
    }
  }, [user, isLoading, pathname, router]);

  useEffect(() => {
    const handleAuthExpired = () => {
      if (pathname !== "/login") {
        setIsRedirecting(true);
        queryClient.removeQueries({ queryKey: ["auth-user"] });
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

    setIsRedirecting(true);
    queryClient.removeQueries({ queryKey: ["auth-user"] });
    router.push("/login");
  };

  if (isLoading || isRedirecting) {
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
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
