"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Problem = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
  status: string;
  createdAt: string;
  business: { name: string };
  _count: { proposals: number };
};

const CATEGORIES = ["All", "Technology", "Marketing", "Design", "Finance", "Operations", "Legal", "HR", "Other"];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    OPEN: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-yellow-100 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return map[status] ?? "";
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("/api/problems")
      .then((r) => r.json())
      .then(setProblems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = problems.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Open Problems</h1>
        <p className="text-muted-foreground mt-1">
          Browse business challenges and submit your proposal.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          id="problems-search"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground">No problems found</h3>
          <p className="text-muted-foreground mt-1">
            {search || category !== "All"
              ? "Try adjusting your filters."
              : "No open problems yet — check back soon!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/problems/${p.id}`}>
              <Card className="group h-full hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs font-medium text-primary border-primary/30 bg-primary/5"
                    >
                      {p.category}
                    </Badge>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusBadge(p.status)}`}>
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 mt-2">
                    {p.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex flex-col items-start gap-2">
                  <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <span>💰 {p.budget}</span>
                    <span>⏱ {p.timeline}</span>
                  </div>
                  <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <span>by {p.business.name}</span>
                    <span>{p._count.proposals} proposal{p._count.proposals !== 1 ? "s" : ""}</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Showing {filtered.length} of {problems.length} problems
        {" · "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up to submit proposals
        </Link>
      </div>
    </div>
  );
}
