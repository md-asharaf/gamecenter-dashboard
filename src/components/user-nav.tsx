"use client";

import { useAuth } from "@/providers/auth-provider";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserNav() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="ml-auto flex items-center gap-2 text-sm font-medium">
      <span className="hidden sm:inline-block text-muted-foreground mr-1">{user.email}</span>
      <Avatar className="h-8 w-8 bg-primary/10 text-primary">
        <AvatarImage src="" alt={user.email} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
