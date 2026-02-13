import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen } from "lucide-react";

// Lazy load pages for code splitting
const LandingPage = lazy(() => import("@/pages/landing"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Rooms = lazy(() => import("@/pages/rooms"));
const RoomBuilder = lazy(() => import("@/pages/room-builder"));
const RoomDetail = lazy(() => import("@/pages/room-detail"));
const FileLibrary = lazy(() => import("@/pages/file-library"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Team = lazy(() => import("@/pages/team"));
const Settings = lazy(() => import("@/pages/settings"));
const PublicRoom = lazy(() => import("@/pages/public-room"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="space-y-3 text-center">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
          <FolderOpen className="h-5 w-5 text-primary" />
        </div>
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
    </div>
  );
}

function AuthenticatedLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 px-4 border-b h-14 flex-shrink-0 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto custom-scrollbar">
            <Suspense fallback={<PageLoader />}>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/rooms" component={Rooms} />
                <Route path="/rooms/new" component={RoomBuilder} />
                <Route path="/rooms/:id" component={RoomDetail} />
                <Route path="/files" component={FileLibrary} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/team" component={Team} />
                <Route path="/settings" component={Settings} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-xl animated-gradient flex items-center justify-center mx-auto shadow-md">
            <FolderOpen className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/r/:token" component={PublicRoom} />
        {user ? (
          <Route>
            <AuthenticatedLayout />
          </Route>
        ) : (
          <Route component={LandingPage} />
        )}
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
