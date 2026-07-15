"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
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
                className={`transition-colors hover:text-foreground/80 px-3 py-2 rounded-md text-sm ${
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
              <div className="ml-3 flex items-center gap-3 border-l border-border pl-4">
                {session.user.role === "ADMIN" && (
                  <Badge variant="default">Admin</Badge>
                )}
                <Link href="/settings" className="flex items-center gap-2 group">
                  <div className="h-8 w-8 rounded-full bg-muted border overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                    {session.user.image ? (
                      <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-2">
          {session?.user && session.user.role === "ADMIN" && (
             <Badge variant="default" className="mr-2">Admin</Badge>
          )}
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2 mb-4 mt-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  O
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">
                  Opportunity OS
                </span>
              </Link>

              <Link
                href="/feed"
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
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
                    className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      pathname === "/studio" || pathname === "/admin"
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {session.user.role === "ADMIN" ? "Admin Panel" : "Studio"}
                  </Link>
                  {session.user.role !== "ADMIN" && (
                    <Link href="/opportunities/new" className="px-4">
                      <Button className="w-full">
                        Post a Opportunity
                      </Button>
                    </Link>
                  )}
                  
                  <div className="mt-auto flex flex-col gap-4 border-t pt-4">
                    <Link href="/settings" className="flex items-center gap-3 px-4">
                      <div className="h-8 w-8 rounded-full bg-muted border overflow-hidden flex items-center justify-center">
                        {session.user.image ? (
                          <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <div className="px-4">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => signOut({ callbackUrl: "/" })}
                      >
                        Sign out
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-auto flex flex-col gap-2 border-t pt-4 px-4">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
