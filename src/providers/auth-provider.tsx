"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/types/user";
import { api } from "@/lib/api/axios";
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

  const { data: user = null, isLoading, isError } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const res = await api.get("/admins/me");
      return res.data.data as User;
    },
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isLoading) return;

    if (user && pathname === "/login") {
      router.push("/");
    } else if (isError && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, isError, isLoading, pathname, router]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout failed on backend", e);
    }

    queryClient.clear();
    router.push("/login");
  };

  if (isLoading) {
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
