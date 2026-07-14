import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { Sparkles, Globe, Zap, Users } from "lucide-react";

const FEATURES = [
  {
    icon: <Globe className="h-6 w-6 text-primary" />,
    title: "One Universal Account",
    description:
      "No more 'Client' vs 'Freelancer' boundaries. You can post an opportunity in the morning, and solve one in the afternoon. Total freedom.",
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "The Mission Feed",
    description:
      "Explore a personalized, infinite feed of opportunities. Filter by tags, skills, timeline, and more to find exactly what you want to work on.",
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Collaborate & Execute",
    description:
      "Submit applications, discuss the scope, and execute the work seamlessly. A unified workspace for all your professional interactions.",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: "AI Matching (Coming Soon)",
    description:
      "Soon, our AI will instantly parse your raw ideas into full project scopes and perfectly match you with the right talent using vector similarity.",
  },
];

export default async function HomePage() {
  const [totalOpportunities, totalUsers] = await Promise.all([
    prisma.opportunity.count(),
    prisma.user.count()
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/30 py-24 sm:py-32">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 text-primary border-primary/20 bg-primary/10 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 inline-block mr-2" />
            AI Matching is Coming Soon
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            The Operating System for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
              Opportunities
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Don't get boxed into a "freelancer" or "client" role. Post what you need. Build what you love. One universal account for infinite possibilities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Initialize Your Profile →
              </Button>
            </Link>
            <Link href="/feed">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base border-primary/30 hover:border-primary hover:bg-primary/5 transition-all">
                Explore the Feed
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: totalOpportunities.toLocaleString(), label: "Active Opportunities" },
              { value: totalUsers.toLocaleString(), label: "Network Nodes" },
              { value: "0%", label: "Platform Fees" },
              { value: "Infinite", label: "Possibilities" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Coming Soon Highlight */}
      <section className="py-20 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center relative z-10">
          <Sparkles className="h-12 w-12 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">AI Architecture (Coming Soon)</h2>
          <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
            We are building an intelligent vector-matching engine. Soon, you will be able to type a raw sentence like "I need someone to build a website," and our AI will automatically structure the opportunity, estimate the budget, and immediately ping the most relevant users in our network.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">A Better Way to Work</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything you need to collaborate, built around a single, flexible primitive.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border bg-white p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-3 text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Opportunity OS. Built for the future of work.
        </div>
      </footer>
    </div>
  );
}
