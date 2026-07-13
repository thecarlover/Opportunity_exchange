"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="text-5xl mb-6">⚠️</div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We apologize for the inconvenience. An unexpected error occurred while processing your request. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} size="lg">
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/"} size="lg">
          Return Home
        </Button>
      </div>
    </div>
  );
}
