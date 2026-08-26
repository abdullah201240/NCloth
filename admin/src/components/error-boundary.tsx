"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Studio Admin Caught Runtime Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-background text-foreground">
          <Card className="w-full max-w-lg border border-destructive/40 bg-background shadow-none rounded-xs p-6 space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 border border-destructive/30 rounded-xs bg-destructive/10">
                <AlertTriangle className="size-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Studio Runtime Exception
                </CardTitle>
                <p className="text-xs font-mono text-muted-foreground">
                  An unexpected error occurred in this view.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3 border border-border bg-muted/10 rounded-xs font-mono text-xs text-muted-foreground overflow-x-auto max-h-36">
                <p className="font-semibold text-destructive">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-8 text-xs border-border gap-1.5"
              >
                <RefreshCw className="size-3.5" /> Reload View
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  this.handleReset();
                  window.location.href = "/";
                }}
                className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium gap-1.5"
              >
                <Home className="size-3.5" /> Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
