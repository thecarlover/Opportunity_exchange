import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  "Technology",
  "Marketing",
  "Design",
  "Finance",
  "Operations",
  "Legal",
  "HR",
  "Other",
];

const FEATURES = [
  {
    icon: "🎯",
    title: "Post Your Problem",
    description:
      "Describe your business challenge with details on budget and timeline. Get it in front of hundreds of expert solution providers.",
  },
  {
    icon: "💡",
    title: "Receive Proposals",
    description:
      "Solution providers submit detailed proposals with pricing and approach. Compare and choose the best fit for your needs.",
  },
  {
    icon: "🤝",
    title: "Accept & Connect",
    description:
      "Accept the winning proposal. Both parties instantly see each other's contact email to get started.",
  },
  {
    icon: "⭐",
    title: "Rate & Review",
    description:
      "After completion, businesses leave a star rating. Build trust and reputation in the marketplace.",
  },
];

export default async function HomePage() {
  const [totalProblems, totalProviders, totalBusinesses] = await Promise.all([
    prisma.problem.count(),
    prisma.user.count({ where: { role: "SOLUTION_PROVIDER" } }),
    prisma.user.count({ where: { role: "BUSINESS" } })
  ]);
  const totalUsers = totalProviders + totalBusinesses;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/30 py-24 sm:py-32">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 text-primary border-primary/20 bg-primary/10">
            🚀 The B2B Problem-Solution Marketplace
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            Turn Business Problems{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
              Into Solved
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Solvd.io connects businesses with expert solution providers.
            Post your challenge, receive targeted proposals, and find the perfect match
            — all in one streamlined marketplace.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Post a Problem Free →
              </Button>
            </Link>
            <Link href="/problems">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base border-primary/30 hover:border-primary hover:bg-primary/5 transition-all">
                Browse Open Problems
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-muted-foreground">Live Marketplace Activity</h3>
          </div>
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: totalProblems.toLocaleString(), label: "Problems Posted" },
              { value: totalUsers.toLocaleString(), label: "Users Signed Up" },
              { value: "98%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A simple 4-step process to connect businesses with the right solutions.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border bg-white p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="absolute top-4 right-4 text-xs font-bold text-muted-foreground/40">
                  0{i + 1}
                </div>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gradient-to-br from-muted/50 to-accent/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat} href={`/problems?category=${cat}`}>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200"
                >
                  {cat}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA split */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-violet-700 p-8 text-white">
              <div className="text-3xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-3">For Businesses</h3>
              <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                Post your problem once and receive tailored proposals from verified
                solution providers. Set your budget, timeline, and let the marketplace
                do the rest.
              </p>
              <Link href="/signup">
                <Button variant="secondary" className="font-semibold">
                  Post Your First Problem →
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-8">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-foreground mb-3">For Solution Providers</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Browse real business problems, submit proposals on the ones you can
                solve, build your reputation with ratings, and grow your client base.
              </p>
              <Link href="/signup">
                <Button className="font-semibold">
                  Start Submitting Proposals →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © 2024 Solvd.io. Built for the B2B marketplace.
        </div>
      </footer>
    </div>
  );
}
