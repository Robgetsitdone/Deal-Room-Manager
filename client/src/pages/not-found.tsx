import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-10 text-center">
        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <FolderOpen className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}
