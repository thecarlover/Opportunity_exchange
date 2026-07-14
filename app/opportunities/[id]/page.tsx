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
type Application = {
  id: string;
  applicantId: string;
  message: string;
  price: string;
  timeline: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  applicant: Provider;
};
type Rating = { stars: number; comment?: string };
type Opportunity = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
  status: "OPEN" | "CLOSED" | "COMPLETED";
  createdAt: string;
  posterId: string;
  poster: { id: string; name: string; email?: string };
  applications: Application[];
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
  const [opportunity, setProblem] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  // Application form state
  const [proposalForm, setProposalForm] = useState({ message: "", price: "", timeline: "" });
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [alreadyProposed, setAlreadyProposed] = useState(false);

  // Rating form state
  const [ratingForm, setRatingForm] = useState({ stars: 0, comment: "" });
  const [submittingRating, setSubmittingRating] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  async function fetchProblem() {
    try {
      const res = await fetch(`/api/opportunities/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data: Opportunity = await res.json();
      setProblem(data);
      // Check if current user already submitted a application
      if (session?.user && session.user.id !== data.posterId) {
        const hasProposal = data.applications.some((p) => p.applicantId === session.user.id);
        setAlreadyProposed(hasProposal);
      }
    } catch {
      toast.error("Could not load opportunity");
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
      const res = await fetch(`/api/opportunities/${id}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit application");
        return;
      }
      toast.success("Application submitted!");
      setProposalForm({ message: "", price: "", timeline: "" });
      setAlreadyProposed(true);
      fetchProblem();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingProposal(false);
    }
  }

  async function acceptProposal(applicationId: string) {
    try {
      const res = await fetch(`/api/opportunities/${id}/applications/${applicationId}/accept`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to accept application");
        return;
      }
      toast.success("Application accepted! Contact emails revealed.");
      fetchProblem();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function markComplete() {
    setMarkingComplete(true);
    try {
      const res = await fetch(`/api/opportunities/${id}/complete`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to mark complete");
        return;
      }
      toast.success("Opportunity marked as complete!");
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
      const res = await fetch(`/api/opportunities/${id}/rating`, {
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

  if (!opportunity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-semibold">Opportunity not found</h2>
        <Link href="/opportunities" className="mt-4">
          <Button variant="outline">Browse Opportunities</Button>
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === opportunity.posterId;
  const isProvider = session?.user && !isOwner;
  const acceptedProposal = opportunity.applications.find((p) => p.status === "ACCEPTED");
  const myProposal = opportunity.applications.find((p) => p.applicantId === session?.user?.id);

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

  // Applications visible: owner sees all, applicant sees only their own
  const visibleProposals = isOwner
    ? opportunity.applications
    : opportunity.applications.filter((p) => p.applicantId === session?.user?.id);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Link href="/opportunities" className="text-sm text-muted-foreground hover:text-primary transition-colors">
        ← Back to opportunities
      </Link>

      {/* Opportunity Header */}
      <div className="mt-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
            {opportunity.category}
          </Badge>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor[opportunity.status]}`}>
            {opportunity.status.charAt(0) + opportunity.status.slice(1).toLowerCase()}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground leading-tight">{opportunity.title}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          <span>Posted by <strong>{opportunity.poster.name}</strong></span>
          <span>·</span>
          <span>Budget: <strong>{opportunity.budget}</strong></span>
          <span>·</span>
          <span>Timeline: <strong>{opportunity.timeline}</strong></span>
          <span>·</span>
          <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Opportunity Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </CardContent>
          </Card>

          {/* Email reveal — accepted application */}
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
                      href={`mailto:${acceptedProposal.applicant.email}`}
                      className="text-sm text-green-700 hover:underline font-mono"
                    >
                      {acceptedProposal.applicant.email}
                    </a>
                  </div>
                )}
                {myProposal?.status === "ACCEPTED" && opportunity.poster.email && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-sm font-medium text-green-800 min-w-[140px]">Business Email:</span>
                    <a
                      href={`mailto:${opportunity.poster.email}`}
                      className="text-sm text-green-700 hover:underline font-mono"
                    >
                      {opportunity.poster.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Applications list */}
          {session && (isOwner || myProposal) && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {isOwner ? `Applications (${visibleProposals.length})` : "Your Application"}
              </h2>
              {visibleProposals.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-dashed border-border text-muted-foreground">
                  No applications yet. Be the first to submit one!
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleProposals.map((application) => (
                    <Card
                      key={application.id}
                      className={`border-border/50 ${application.status === "ACCEPTED" ? "ring-2 ring-green-400/30" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{application.applicant.name}</p>
                            {application.applicant.bio && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {application.applicant.bio}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${proposalStatusColor[application.status]}`}>
                            {application.status.charAt(0) + application.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">{application.message}</p>
                        <div className="flex gap-4 text-sm">
                          <span><strong>Price:</strong> {application.price}</span>
                          <span><strong>Timeline:</strong> {application.timeline}</span>
                        </div>
                        {isOwner && application.status === "PENDING" && opportunity.status === "OPEN" && (
                          <Button
                            size="sm"
                            onClick={() => acceptProposal(application.id)}
                            className="mt-2"
                          >
                            ✓ Accept This Application
                          </Button>
                        )}
                        {application.status === "ACCEPTED" && application.applicant.email && isOwner && (
                          <div className="text-xs text-green-600 font-medium">
                            📧 {application.applicant.email}
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
          {opportunity.rating && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-base text-yellow-700">⭐ Provider Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={s <= opportunity.rating!.stars ? "text-yellow-400 text-xl" : "text-muted-foreground/30 text-xl"}>★</span>
                  ))}
                </div>
                {opportunity.rating.comment && (
                  <p className="text-sm text-yellow-800 italic">&ldquo;{opportunity.rating.comment}&rdquo;</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Submit application — Provider only, opportunity OPEN */}
          {isProvider && opportunity.status === "OPEN" && !alreadyProposed && (
            <Card className="border-primary/20 bg-primary/3">
              <CardHeader>
                <CardTitle className="text-base">Submit Your Application</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitProposal} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="application-message" className="text-xs">Your Message *</Label>
                    <Textarea
                      id="application-message"
                      placeholder="Describe how you'd solve this opportunity..."
                      value={proposalForm.message}
                      onChange={(e) => setProposalForm({ ...proposalForm, message: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="application-price" className="text-xs">Proposed Price *</Label>
                    <Input
                      id="application-price"
                      placeholder="e.g. $3,500"
                      value={proposalForm.price}
                      onChange={(e) => setProposalForm({ ...proposalForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="application-timeline" className="text-xs">Proposed Timeline *</Label>
                    <Input
                      id="application-timeline"
                      placeholder="e.g. 3 weeks"
                      value={proposalForm.timeline}
                      onChange={(e) => setProposalForm({ ...proposalForm, timeline: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submittingProposal}>
                    {submittingProposal ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {isProvider && alreadyProposed && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm font-medium text-green-700">Application submitted!</p>
                <p className="text-xs text-green-600 mt-1">The poster will review and respond.</p>
              </CardContent>
            </Card>
          )}

          {!session && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Sign in to submit a application</p>
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
                  <p>Status: <strong>{opportunity.status.charAt(0) + opportunity.status.slice(1).toLowerCase()}</strong></p>
                  <p>Applications: <strong>{opportunity.applications.length}</strong></p>
                </div>
                <Separator />
                {opportunity.status === "CLOSED" && !opportunity.rating && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Mark this opportunity as completed to leave a rating.</p>
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
                {opportunity.status === "COMPLETED" && !opportunity.rating && (
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
                {opportunity.rating && (
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
