"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Opportunity = {
  id: string;
  title: string;
  category: string;
  budget: string;
  timeline: string;
  status: string;
  createdAt: string;
  _count: { applications: number };
  applications: {
    status: string;
    applicant: { name: string; email: string };
  }[];
  rating: { stars: number } | null;
};

type Application = {
  id: string;
  message: string;
  price: string;
  timeline: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  opportunity: {
    id: string;
    title: string;
    category: string;
    budget: string;
    poster: { name: string };
  };
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    OPEN: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-yellow-100 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    ACCEPTED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
  };
  return map[status] ?? "";
}

function BusinessDashboard({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-foreground">No opportunities posted yet</h3>
        <p className="text-muted-foreground mt-1 mb-6">Start by posting your first poster opportunity.</p>
        <Link href="/opportunities/new">
          <Button>Post a Opportunity →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((p) => {
        const acceptedProposal = p.applications.find((pr) => pr.status === "ACCEPTED");
        return (
          <Card key={p.id} className="hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                  {p.category}
                </Badge>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusBadge(p.status)}`}>
                  {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                </span>
              </div>
              <CardTitle className="text-sm leading-snug line-clamp-2">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>💰 {p.budget}</span>
                <span>⏱ {p.timeline}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                📄 {p._count.applications} application{p._count.applications !== 1 ? "s" : ""}
              </div>
              {acceptedProposal && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ Accepted: {acceptedProposal.applicant.name}
                </div>
              )}
              {p.rating && (
                <div className="text-xs text-yellow-600">
                  {["★", "★", "★", "★", "★"].slice(0, p.rating.stars).join("")} Rated
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Link href={`/opportunities/${p.id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  View Details →
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function ProviderDashboard({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
        <div className="text-4xl mb-4">💡</div>
        <h3 className="text-lg font-semibold text-foreground">No applications yet</h3>
        <p className="text-muted-foreground mt-1 mb-6">Browse open opportunities and submit your first application.</p>
        <Link href="/feed">
          <Button>Mission Feed →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {applications.map((p) => (
        <Card key={p.id} className="hover:border-primary/40 hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                {p.opportunity.category}
              </Badge>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusBadge(p.status)}`}>
                {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
              </span>
            </div>
            <CardTitle className="text-sm leading-snug line-clamp-2">{p.opportunity.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            <div className="text-xs text-muted-foreground">
              by {p.opportunity.poster.name}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>💰 My price: {p.price}</span>
              <span>⏱ {p.timeline}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 italic">&ldquo;{p.message}&rdquo;</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href={`/opportunities/${p.opportunity.id}`} className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                View Opportunity →
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<{
    role: string;
    opportunities?: Opportunity[];
    applications?: Application[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/studio")
        .then(async (r) => {
          if (!r.ok) return null;
          return r.json();
        })
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold">Sign in required</h2>
        <p className="text-muted-foreground mt-2 mb-6">Please log in to view your dashboard.</p>
        <Link href="/login"><Button>Log in</Button></Link>
      </div>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin";
    }
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            My Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <strong>{session.user.name}</strong>!
            Manage your posted opportunities and track your submitted applications.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/feed">
            <Button variant="outline">Mission Feed</Button>
          </Link>
          <Link href="/opportunities/new">
            <Button className="shadow-sm">+ Post a Opportunity</Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {data.opportunities && [
            { label: "Total Opportunities", value: data.opportunities.length },
            { label: "Open", value: data.opportunities.filter((p) => p.status === "OPEN").length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
          {data.applications && [
            { label: "Total Applications", value: data.applications.length },
            { label: "Accepted", value: data.applications.filter((p) => p.status === "ACCEPTED").length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {data?.opportunities && data.opportunities.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Opportunities I Posted</h2>
          <BusinessDashboard opportunities={data.opportunities} />
        </div>
      )}
      
      {data?.applications && data.applications.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">My Submitted Applications</h2>
          <ProviderDashboard applications={data.applications} />
        </div>
      )}
      
      {data?.opportunities?.length === 0 && data?.applications?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-card">
          <div className="text-4xl mb-4">👋</div>
          <h3 className="text-lg font-semibold text-foreground">Welcome to Solvd.io!</h3>
          <p className="text-muted-foreground mt-1 mb-6 max-w-md mx-auto">You haven't posted any opportunities or submitted any applications yet. Choose what you'd like to do first.</p>
          <div className="flex gap-4">
            <Link href="/opportunities/new">
              <Button>Post a Opportunity</Button>
            </Link>
            <Link href="/feed">
              <Button variant="outline">Mission Feed</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
