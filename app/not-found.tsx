import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600 mb-6">
        404
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
        Page Not Found
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
      </p>
      <Link href="/">
        <Button size="lg" className="px-8 h-12 shadow-md">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
