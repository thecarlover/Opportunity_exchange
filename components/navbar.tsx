"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            O
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Opportunity OS
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/feed"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === "/feed"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Mission Feed
          </Link>

          {session?.user ? (
            <>
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/studio"}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/studio" || pathname === "/admin"
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {session.user.role === "ADMIN" ? "Admin Panel" : "Studio"}
              </Link>
              {session.user.role !== "ADMIN" && (
                <Link href="/opportunities/new">
                  <Button size="sm" className="ml-2">
                    Post a Opportunity
                  </Button>
                </Link>
              )}
              <div className="ml-3 flex items-center gap-2">
                {session.user.role === "ADMIN" && (
                  <Badge variant="default" className="hidden sm:flex">Admin</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
