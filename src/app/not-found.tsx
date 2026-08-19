import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  );
}
