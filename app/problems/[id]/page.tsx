"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type Provider = { id: string; name: string; bio?: string; email?: string };
type Proposal = {
  id: string;
  providerId: string;
  message: string;
  price: string;
  timeline: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  provider: Provider;
};
type Rating = { stars: number; comment?: string };
type Problem = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
  status: "OPEN" | "CLOSED" | "COMPLETED";
  createdAt: string;
  businessId: string;
  business: { id: string; name: string; email?: string };
  proposals: Proposal[];
  rating: Rating | null;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-transform hover:scale-110 ${
            star <= value ? "text-yellow-400" : "text-muted-foreground/30"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  // Proposal form state
  const [proposalForm, setProposalForm] = useState({ message: "", price: "", timeline: "" });
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [alreadyProposed, setAlreadyProposed] = useState(false);

  // Rating form state
  const [ratingForm, setRatingForm] = useState({ stars: 0, comment: "" });
  const [submittingRating, setSubmittingRating] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  async function fetchProblem() {
    try {
      const res = await fetch(`/api/problems/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data: Problem = await res.json();
      setProblem(data);
      // Check if current provider already submitted
      if (session?.user?.role === "SOLUTION_PROVIDER") {
        const hasProposal = data.proposals.some((p) => p.providerId === session.user.id);
        setAlreadyProposed(hasProposal);
      }
    } catch {
      toast.error("Could not load problem");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session]);

  async function submitProposal(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingProposal(true);
    try {
      const res = await fetch(`/api/problems/${id}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit proposal");
        return;
      }
      toast.success("Proposal submitted!");
      setProposalForm({ message: "", price: "", timeline: "" });
      setAlreadyProposed(true);
      fetchProblem();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingProposal(false);
    }
  }

  async function acceptProposal(proposalId: string) {
    try {
      const res = await fetch(`/api/problems/${id}/proposals/${proposalId}/accept`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to accept proposal");
        return;
      }
      toast.success("Proposal accepted! Contact emails revealed.");
      fetchProblem();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function markComplete() {
    setMarkingComplete(true);
    try {
      const res = await fetch(`/api/problems/${id}/complete`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to mark complete");
        return;
      }
      toast.success("Problem marked as complete!");
      fetchProblem();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setMarkingComplete(false);
    }
  }

  async function submitRating(e: React.FormEvent) {
    e.preventDefault();
    if (ratingForm.stars === 0) { toast.error("Please select a star rating"); return; }
    setSubmittingRating(true);
    try {
      const res = await fetch(`/api/problems/${id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingForm),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit rating");
        return;
      }
      toast.success("Rating submitted! 🎉");
      fetchProblem();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingRating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-4">
        <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-semibold">Problem not found</h2>
        <Link href="/problems" className="mt-4">
          <Button variant="outline">Browse Problems</Button>
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === problem.businessId;
  const isProvider = session?.user?.role === "SOLUTION_PROVIDER";
  const acceptedProposal = problem.proposals.find((p) => p.status === "ACCEPTED");
  const myProposal = problem.proposals.find((p) => p.providerId === session?.user?.id);

  const statusColor: Record<string, string> = {
    OPEN: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-yellow-100 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const proposalStatusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    ACCEPTED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  // Proposals visible: owner sees all, provider sees only their own
  const visibleProposals = isOwner
    ? problem.proposals
    : problem.proposals.filter((p) => p.providerId === session?.user?.id);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Link href="/problems" className="text-sm text-muted-foreground hover:text-primary transition-colors">
        ← Back to problems
      </Link>

      {/* Problem Header */}
      <div className="mt-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
            {problem.category}
          </Badge>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor[problem.status]}`}>
            {problem.status.charAt(0) + problem.status.slice(1).toLowerCase()}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground leading-tight">{problem.title}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          <span>Posted by <strong>{problem.business.name}</strong></span>
          <span>·</span>
          <span>Budget: <strong>{problem.budget}</strong></span>
          <span>·</span>
          <span>Timeline: <strong>{problem.timeline}</strong></span>
          <span>·</span>
          <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Problem Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </p>
            </CardContent>
          </Card>

          {/* Email reveal — accepted proposal */}
          {acceptedProposal && (isOwner || myProposal?.status === "ACCEPTED") && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-base text-green-700">🎉 Contact Information Revealed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isOwner && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-sm font-medium text-green-800 min-w-[140px]">Provider&apos;s Email:</span>
                    <a
                      href={`mailto:${acceptedProposal.provider.email}`}
                      className="text-sm text-green-700 hover:underline font-mono"
                    >
                      {acceptedProposal.provider.email}
                    </a>
                  </div>
                )}
                {myProposal?.status === "ACCEPTED" && problem.business.email && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-sm font-medium text-green-800 min-w-[140px]">Business Email:</span>
                    <a
                      href={`mailto:${problem.business.email}`}
                      className="text-sm text-green-700 hover:underline font-mono"
                    >
                      {problem.business.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Proposals list */}
          {session && (isOwner || myProposal) && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {isOwner ? `Proposals (${visibleProposals.length})` : "Your Proposal"}
              </h2>
              {visibleProposals.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-border text-muted-foreground">
                  No proposals yet. Be the first to submit one!
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleProposals.map((proposal) => (
                    <Card
                      key={proposal.id}
                      className={`border-border/50 ${proposal.status === "ACCEPTED" ? "ring-2 ring-green-400/30" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{proposal.provider.name}</p>
                            {proposal.provider.bio && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {proposal.provider.bio}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${proposalStatusColor[proposal.status]}`}>
                            {proposal.status.charAt(0) + proposal.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">{proposal.message}</p>
                        <div className="flex gap-4 text-sm">
                          <span><strong>Price:</strong> {proposal.price}</span>
                          <span><strong>Timeline:</strong> {proposal.timeline}</span>
                        </div>
                        {isOwner && proposal.status === "PENDING" && problem.status === "OPEN" && (
                          <Button
                            size="sm"
                            onClick={() => acceptProposal(proposal.id)}
                            className="mt-2"
                          >
                            ✓ Accept This Proposal
                          </Button>
                        )}
                        {proposal.status === "ACCEPTED" && proposal.provider.email && isOwner && (
                          <div className="text-xs text-green-600 font-medium">
                            📧 {proposal.provider.email}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rating display */}
          {problem.rating && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-base text-yellow-700">⭐ Provider Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={s <= problem.rating!.stars ? "text-yellow-400 text-xl" : "text-muted-foreground/30 text-xl"}>★</span>
                  ))}
                </div>
                {problem.rating.comment && (
                  <p className="text-sm text-yellow-800 italic">&ldquo;{problem.rating.comment}&rdquo;</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Submit proposal — Provider only, problem OPEN */}
          {isProvider && problem.status === "OPEN" && !alreadyProposed && (
            <Card className="border-primary/20 bg-primary/3">
              <CardHeader>
                <CardTitle className="text-base">Submit Your Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitProposal} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="proposal-message" className="text-xs">Your Message *</Label>
                    <Textarea
                      id="proposal-message"
                      placeholder="Describe how you'd solve this problem..."
                      value={proposalForm.message}
                      onChange={(e) => setProposalForm({ ...proposalForm, message: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="proposal-price" className="text-xs">Proposed Price *</Label>
                    <Input
                      id="proposal-price"
                      placeholder="e.g. $3,500"
                      value={proposalForm.price}
                      onChange={(e) => setProposalForm({ ...proposalForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="proposal-timeline" className="text-xs">Proposed Timeline *</Label>
                    <Input
                      id="proposal-timeline"
                      placeholder="e.g. 3 weeks"
                      value={proposalForm.timeline}
                      onChange={(e) => setProposalForm({ ...proposalForm, timeline: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submittingProposal}>
                    {submittingProposal ? "Submitting..." : "Submit Proposal"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {isProvider && alreadyProposed && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm font-medium text-green-700">Proposal submitted!</p>
                <p className="text-xs text-green-600 mt-1">The business will review and respond.</p>
              </CardContent>
            </Card>
          )}

          {!session && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Sign in to submit a proposal</p>
                <Link href="/login"><Button className="w-full" size="sm">Log in</Button></Link>
                <Link href="/signup"><Button variant="outline" className="w-full" size="sm">Sign up free</Button></Link>
              </CardContent>
            </Card>
          )}

          {/* Business controls */}
          {isOwner && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Your Controls</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Status: <strong>{problem.status.charAt(0) + problem.status.slice(1).toLowerCase()}</strong></p>
                  <p>Proposals: <strong>{problem.proposals.length}</strong></p>
                </div>
                <Separator />
                {problem.status === "CLOSED" && !problem.rating && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Mark this problem as completed to leave a rating.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={markComplete}
                      disabled={markingComplete}
                    >
                      {markingComplete ? "Marking..." : "Mark as Completed"}
                    </Button>
                  </div>
                )}
                {problem.status === "COMPLETED" && !problem.rating && (
                  <form onSubmit={submitRating} className="space-y-3">
                    <div>
                      <Label className="text-xs mb-2 block">Rate the Solution Provider</Label>
                      <StarRating value={ratingForm.stars} onChange={(v) => setRatingForm({ ...ratingForm, stars: v })} />
                    </div>
                    <div>
                      <Textarea
                        id="rating-comment"
                        placeholder="Leave a short comment (optional)"
                        value={ratingForm.comment}
                        onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full" disabled={submittingRating}>
                      {submittingRating ? "Submitting..." : "Submit Rating ⭐"}
                    </Button>
                  </form>
                )}
                {problem.rating && (
                  <p className="text-xs text-green-600 font-medium">✅ Rating submitted</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
