"use client";

import { useAuth } from "@/providers/auth-provider";
import { User } from "lucide-react";

export function UserNav() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="ml-auto flex items-center gap-2 text-sm font-medium">
      <span className="hidden sm:inline-block text-muted-foreground mr-1">{user.email}</span>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="h-4 w-4" />
      </div>
    </div>
  );
}
