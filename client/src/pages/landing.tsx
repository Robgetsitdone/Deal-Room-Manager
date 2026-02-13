import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FolderOpen,
  BarChart3,
  ArrowRight,
  FileText,
  Eye,
  Lock,
  Clock,
  MousePointerClick,
  Shield,
  Palette,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5" data-testid="link-brand">
            <div className="h-9 w-9 rounded-lg animated-gradient flex items-center justify-center shadow-sm">
              <FolderOpen className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight" data-testid="text-brand-name">
              DealBuddy
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <a href="/api/login">
              <Button variant="ghost" className="font-medium" data-testid="button-login">
                Log In
              </Button>
            </a>
            <a href="/api/login">
              <Button className="font-medium shadow-sm" data-testid="button-get-started">
                Get Started Free
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-6">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium border shadow-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Built for modern sales teams
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Share deal materials.
              <br />
              <span className="text-gradient">Track engagement.</span>
              <br />
              Close faster.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Create branded deal hubs for your prospects. Upload proposals, case studies,
              and product info — then share a single link and see exactly how they engage.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a href="/api/login">
                <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-md hover:shadow-lg transition-shadow" data-testid="button-hero-cta">
                  Create Your First Deal Hub
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Free to start
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Setup in 60 seconds
              </span>
            </div>
          </div>

          {/* Product Preview Card */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-2xl blur-2xl -z-10" />

            <Card className="overflow-hidden shadow-xl border-border/60 rounded-xl">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary/[0.06] to-purple-500/[0.04] border-b px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg bg-primary shadow-sm flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-base" data-testid="text-mockup-title">Acme Corp — Q1 Proposal</p>
                      <p className="text-sm text-muted-foreground">
                        Prepared by Sarah Chen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate font-medium" data-testid="badge-protected">
                      <Lock className="h-3 w-3 mr-1" />
                      Protected
                    </Badge>
                    <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate font-medium" data-testid="badge-views">
                      <Eye className="h-3 w-3 mr-1" />
                      24 views
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-lg bg-background/80 border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Hi team, here are all the materials you need to evaluate our platform.
                    Feel free to share this link with your stakeholders.
                  </p>
                </div>
              </div>

              {/* File List */}
              <div className="px-6 py-5 space-y-2">
                {[
                  { name: "Product Overview.pdf", type: "PDF", size: "2.4 MB", views: 18, lastViewed: "2 min ago" },
                  { name: "Enterprise Pricing.pptx", type: "PPTX", size: "5.1 MB", views: 12, lastViewed: "15 min ago" },
                  { name: "Case Study — TechCo.pdf", type: "PDF", size: "1.8 MB", views: 9, lastViewed: "1 hr ago" },
                  { name: "Security Whitepaper.pdf", type: "PDF", size: "3.2 MB", views: 6, lastViewed: "3 hrs ago" },
                ].map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer group"
                    data-testid={`mockup-file-${file.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.type} · {file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {file.lastViewed}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {file.views}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 border-t bg-muted/20">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex -space-x-2">
                      {[
                        { letter: "JM", color: "bg-blue-500" },
                        { letter: "AL", color: "bg-purple-500" },
                        { letter: "KP", color: "bg-emerald-500" },
                        { letter: "RS", color: "bg-amber-500" },
                      ].map((viewer) => (
                        <div
                          key={viewer.letter}
                          className={`h-7 w-7 rounded-full ${viewer.color} border-2 border-card flex items-center justify-center text-[10px] font-semibold text-white shadow-sm`}
                        >
                          {viewer.letter}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium" data-testid="text-viewers-count">
                      4 viewers this week
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background border px-3 py-1.5 rounded-lg" data-testid="stat-total-clicks">
                      <MousePointerClick className="h-3 w-3 text-primary" />
                      <span className="font-medium">45 clicks</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background border px-3 py-1.5 rounded-lg" data-testid="stat-avg-time">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="font-medium">8 min avg.</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium border mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Simple workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three steps to close deals faster
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              Get your evaluation materials in front of prospects quickly and professionally.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: "1",
                title: "Upload your files",
                desc: "Add proposals, case studies, product sheets, and any materials your prospect needs to evaluate your solution.",
                gradient: "from-blue-500/10 to-blue-600/5",
                iconColor: "text-blue-500",
                iconBg: "bg-blue-500/10",
              },
              {
                icon: Palette,
                step: "2",
                title: "Create a deal hub",
                desc: "Organize files into a branded hub with a custom headline, welcome message, and optional password protection.",
                gradient: "from-purple-500/10 to-purple-600/5",
                iconColor: "text-purple-500",
                iconBg: "bg-purple-500/10",
              },
              {
                icon: BarChart3,
                step: "3",
                title: "Share and track",
                desc: "Send the link to your prospect. See who opened it, which files they viewed, and time spent on each.",
                gradient: "from-emerald-500/10 to-emerald-600/5",
                iconColor: "text-emerald-500",
                iconBg: "bg-emerald-500/10",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="p-7 space-y-4 relative overflow-hidden group hover:shadow-md transition-all duration-300"
                data-testid={`card-step-${feature.step}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-xl ${feature.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">Step {feature.step}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to close deals
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              Built for sales teams who want to look professional and stay informed.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Eye,
                title: "View tracking",
                desc: "Know the moment a prospect opens your deal hub.",
                iconColor: "text-blue-500",
                iconBg: "bg-blue-500/10",
              },
              {
                icon: MousePointerClick,
                title: "Click analytics",
                desc: "See which files get the most attention and engagement.",
                iconColor: "text-purple-500",
                iconBg: "bg-purple-500/10",
              },
              {
                icon: Shield,
                title: "Access controls",
                desc: "Add email gates or passwords for sensitive deals.",
                iconColor: "text-emerald-500",
                iconBg: "bg-emerald-500/10",
              },
              {
                icon: Palette,
                title: "Custom branding",
                desc: "Match your company colors, logo, and messaging.",
                iconColor: "text-amber-500",
                iconBg: "bg-amber-500/10",
              },
            ].map((feat) => (
              <Card key={feat.title} className="p-6 space-y-3 group hover:shadow-md transition-all duration-300" data-testid={`card-feature-${feat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className={`h-10 w-10 rounded-xl ${feat.iconBg} flex items-center justify-center`}>
                  <feat.icon className={`h-5 w-5 ${feat.iconColor}`} />
                </div>
                <h4 className="font-semibold">{feat.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t">
        <div className="max-w-3xl mx-auto">
          <Card className="relative overflow-hidden p-12 text-center">
            <div className="absolute inset-0 animated-gradient opacity-[0.03]" />
            <div className="relative space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Stop sending loose email attachments
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Give your prospects a single, organized place to review everything
                they need. Create your first deal hub in under a minute.
              </p>
              <a href="/api/login">
                <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-md" data-testid="button-bottom-cta">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5" data-testid="link-footer-brand">
            <div className="h-7 w-7 rounded-lg animated-gradient flex items-center justify-center">
              <FolderOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-foreground" data-testid="text-footer-brand">DealBuddy</span>
          </div>
          <p data-testid="text-footer-tagline">Share your deal, close it faster.</p>
        </div>
      </footer>
    </div>
  );
}
