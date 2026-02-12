import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FolderOpen,
  BarChart3,
  Share2,
  Shield,
  ArrowRight,
  Zap,
  Eye,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              DealRoom
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/api/login">
              <Button variant="outline" data-testid="button-login">
                Log In
              </Button>
            </a>
            <a href="/api/login">
              <Button data-testid="button-get-started">Get Started</Button>
            </a>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm text-primary font-medium">
                <Zap className="h-3.5 w-3.5" />
                Built for modern sales teams
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight leading-tight">
                Close deals faster with{" "}
                <span className="text-primary">branded content rooms</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Create beautiful, shareable deal rooms for your prospects.
                Upload files, customize branding, and track exactly who viewed
                what — all from one link.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a href="/api/login">
                  <Button size="lg" data-testid="button-hero-cta">
                    Start for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Free forever plan
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-md border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Acme Corp — Q1 Proposal</p>
                    <p className="text-sm text-muted-foreground">
                      3 files · Shared 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    {
                      name: "Product Overview.pdf",
                      type: "PDF",
                      views: 12,
                    },
                    {
                      name: "Pricing Proposal.pptx",
                      type: "PPTX",
                      views: 8,
                    },
                    {
                      name: "Case Study — TechCo.pdf",
                      type: "PDF",
                      views: 5,
                    },
                  ].map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-3 rounded-md bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {file.type}
                        </div>
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {file.views} views
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex -space-x-2">
                    {["J", "M", "S"].map((letter) => (
                      <div
                        key={letter}
                        className="h-6 w-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs font-medium text-primary"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    3 viewers this week
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-serif font-bold tracking-tight">
              Everything you need to win deals
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Stop sending loose attachments. Give your prospects a polished,
              trackable experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FolderOpen,
                title: "Branded Deal Rooms",
                desc: "Create beautiful, customizable content rooms with your logo, colors, and messaging. One link per deal.",
              },
              {
                icon: BarChart3,
                title: "Engagement Analytics",
                desc: "See exactly who opened your room, which files they viewed, and how long they spent on each asset.",
              },
              {
                icon: Share2,
                title: "Instant Sharing",
                desc: "Share a single link with your prospect. No login required. Optional email gate and password protection.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="p-6 space-y-3 hover-elevate"
              >
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <FolderOpen className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">DealRoom</span>
          </div>
          <p>Built for sales teams that close.</p>
        </div>
      </footer>
    </div>
  );
}
