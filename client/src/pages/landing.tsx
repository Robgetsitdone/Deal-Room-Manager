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
} from "lucide-react";

function CalloutAnnotation({
  label,
  side,
  className = "",
}: {
  label: string;
  side: "left" | "right" | "top" | "bottom";
  className?: string;
}) {
  const arrowMap = {
    left: (
      <svg width="32" height="20" viewBox="0 0 32 20" className="text-primary" aria-hidden="true">
        <path d="M30 10 L6 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        <path d="M10 5 L4 10 L10 15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    right: (
      <svg width="32" height="20" viewBox="0 0 32 20" className="text-primary" aria-hidden="true">
        <path d="M2 10 L26 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        <path d="M22 5 L28 10 L22 15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    top: (
      <svg width="20" height="32" viewBox="0 0 20 32" className="text-primary" aria-hidden="true">
        <path d="M10 30 L10 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        <path d="M5 10 L10 4 L15 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bottom: (
      <svg width="20" height="32" viewBox="0 0 20 32" className="text-primary" aria-hidden="true">
        <path d="M10 2 L10 26" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        <path d="M5 22 L10 28 L15 22" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  const layoutMap = {
    left: "flex-row",
    right: "flex-row-reverse",
    top: "flex-col",
    bottom: "flex-col-reverse",
  };

  return (
    <div className={`flex ${layoutMap[side]} items-center gap-1 ${className}`} data-testid={`callout-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <span className="text-xs font-medium text-primary whitespace-nowrap bg-primary/10 px-2 py-1 rounded-md">
        {label}
      </span>
      {arrowMap[side]}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" data-testid="link-brand">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight" data-testid="text-brand-name">
              DealBuddy
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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

      <section className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight leading-tight">
              Share evaluation materials with your prospects in one place
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              DealBuddy lets you organize files into a single, shareable link
              for your prospect. Upload your proposals, case studies, and
              product info, then share a clean deal hub they can access
              anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="/api/login">
                <Button size="lg" data-testid="button-hero-cta">
                  Create a Deal Hub
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="hidden lg:block absolute -left-44 top-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300 fill-mode-both">
              <CalloutAnnotation label="Custom branding" side="right" />
            </div>
            <div className="hidden lg:block absolute -left-52 top-[140px] animate-in fade-in slide-in-from-left-4 duration-700 delay-500 fill-mode-both">
              <CalloutAnnotation label="Real-time view counts" side="right" />
            </div>
            <div className="hidden lg:block absolute -left-44 bottom-[90px] animate-in fade-in slide-in-from-left-4 duration-700 delay-700 fill-mode-both">
              <CalloutAnnotation label="Viewer activity" side="right" />
            </div>

            <div className="hidden lg:block absolute -right-48 top-4 animate-in fade-in slide-in-from-right-4 duration-700 delay-400 fill-mode-both">
              <CalloutAnnotation label="One shareable link" side="left" />
            </div>
            <div className="hidden lg:block absolute -right-52 top-[180px] animate-in fade-in slide-in-from-right-4 duration-700 delay-600 fill-mode-both">
              <CalloutAnnotation label="Password protection" side="left" />
            </div>
            <div className="hidden lg:block absolute -right-52 bottom-[50px] animate-in fade-in slide-in-from-right-4 duration-700 delay-800 fill-mode-both">
              <CalloutAnnotation label="Engagement analytics" side="left" />
            </div>

            <Card className="p-0 overflow-visible shadow-lg">
              <div className="rounded-t-md bg-primary/5 border-b px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
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
                    <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate" data-testid="badge-protected">
                      <Lock className="h-3 w-3 mr-1" />
                      Protected
                    </Badge>
                    <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate" data-testid="badge-views">
                      <Eye className="h-3 w-3 mr-1" />
                      24 views
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-md bg-background border">
                  <p className="text-sm text-muted-foreground">
                    Hi team, here are all the materials you need to evaluate our platform.
                    Feel free to share this link with your stakeholders.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 space-y-2">
                {[
                  {
                    name: "Product Overview.pdf",
                    type: "PDF",
                    size: "2.4 MB",
                    views: 18,
                    lastViewed: "2 min ago",
                  },
                  {
                    name: "Enterprise Pricing.pptx",
                    type: "PPTX",
                    size: "5.1 MB",
                    views: 12,
                    lastViewed: "15 min ago",
                  },
                  {
                    name: "Case Study — TechCo.pdf",
                    type: "PDF",
                    size: "1.8 MB",
                    views: 9,
                    lastViewed: "1 hr ago",
                  },
                  {
                    name: "Security Whitepaper.pdf",
                    type: "PDF",
                    size: "3.2 MB",
                    views: 6,
                    lastViewed: "3 hrs ago",
                  },
                ].map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50 hover-elevate"
                    data-testid={`mockup-file-${file.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-md bg-background border flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.type} · {file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {file.lastViewed}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {file.views}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex -space-x-2">
                      {[
                        { letter: "JM" },
                        { letter: "AL" },
                        { letter: "KP" },
                        { letter: "RS" },
                      ].map((viewer) => (
                        <div
                          key={viewer.letter}
                          className="h-7 w-7 rounded-full bg-primary border-2 border-card flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                        >
                          {viewer.letter}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground" data-testid="text-viewers-count">
                      4 viewers this week
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md" data-testid="stat-total-clicks">
                      <MousePointerClick className="h-3 w-3" />
                      <span>45 total clicks</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md" data-testid="stat-avg-time">
                      <TrendingUp className="h-3 w-3" />
                      <span>8 min avg. time</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-serif font-bold tracking-tight">
              How it works
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Get your evaluation materials in front of prospects quickly and
              professionally.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                step: "1",
                title: "Upload your files",
                desc: "Add proposals, case studies, product sheets, and any other materials your prospect needs to evaluate your solution.",
              },
              {
                icon: Palette,
                step: "2",
                title: "Create a deal hub",
                desc: "Organize your files into a branded deal hub with a custom headline, welcome message, and optional password protection.",
              },
              {
                icon: BarChart3,
                step: "3",
                title: "Share and track",
                desc: "Send the link to your prospect. See who opened it, which files they viewed, and how long they spent reviewing each one.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="p-6 space-y-3"
                data-testid={`card-step-${feature.step}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-foreground">{feature.step}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold tracking-tight">
              Everything you need to close deals faster
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Built for sales teams who want to look professional and stay informed.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Eye,
                title: "View tracking",
                desc: "Know the moment a prospect opens your deal hub.",
              },
              {
                icon: MousePointerClick,
                title: "Click analytics",
                desc: "See which files get the most attention.",
              },
              {
                icon: Shield,
                title: "Access controls",
                desc: "Add email gates or passwords for sensitive deals.",
              },
              {
                icon: Palette,
                title: "Custom branding",
                desc: "Match your company colors and messaging.",
              },
            ].map((feat) => (
              <Card key={feat.title} className="p-5 space-y-2" data-testid={`card-feature-${feat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <feat.icon className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-sm">{feat.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 border-t">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-2xl font-serif font-bold tracking-tight">
            Stop sending loose email attachments
          </h2>
          <p className="text-muted-foreground">
            Give your prospects a single, organized place to review everything
            they need. Create your first deal hub in under a minute.
          </p>
          <a href="/api/login">
            <Button size="lg" data-testid="button-bottom-cta">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2" data-testid="link-footer-brand">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <FolderOpen className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground" data-testid="text-footer-brand">DealBuddy</span>
          </div>
          <p data-testid="text-footer-tagline">Share your deal, close it faster.</p>
        </div>
      </footer>
    </div>
  );
}
