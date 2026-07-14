"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const CATEGORIES = ["Technology", "Marketing", "Design", "Finance", "Operations", "Legal", "HR", "Other"];

export default function NewProblemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    timeline: "",
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold">Sign in required</h2>
        <p className="text-muted-foreground mt-2 mb-6">Please log in to post a opportunity.</p>
        <Link href="/login"><Button>Log in</Button></Link>
      </div>
    );
  }



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) { toast.error("Please select a category"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to post opportunity");
        return;
      }
      toast.success("Opportunity posted successfully!");
      router.push(`/opportunities/${data.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/opportunities" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to opportunities
        </Link>
        <h1 className="text-3xl font-bold text-foreground mt-3">Post a New Opportunity</h1>
        <p className="text-muted-foreground mt-1">
          Describe your challenge clearly to attract the best solution providers.
        </p>
      </div>

      <Card className="shadow-sm border-border/50">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
            <CardDescription>
              Be specific and detailed — better descriptions attract better applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="opportunity-title">Opportunity Title *</Label>
              <Input
                id="opportunity-title"
                placeholder="e.g. Need a CRM integration with our existing ERP system"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunity-description">Opportunity Description *</Label>
              <Textarea
                id="opportunity-description"
                placeholder="Describe the opportunity in detail. What is the current situation? What outcome do you need? What constraints exist?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opportunity-category">Category *</Label>
                <Select onValueChange={(v: string | null) => setForm({ ...form, category: v ?? "" })}>
                  <SelectTrigger id="opportunity-category">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunity-budget">Budget *</Label>
                <Input
                  id="opportunity-budget"
                  placeholder="e.g. $5,000–$10,000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunity-timeline">Timeline *</Label>
                <Input
                  id="opportunity-timeline"
                  placeholder="e.g. 4–6 weeks"
                  value={form.timeline}
                  onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 text-sm text-primary">
              <strong>💡 Tip:</strong> Opportunities with clear budgets and timelines receive 3x more applications.
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Posting..." : "Post Opportunity"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
