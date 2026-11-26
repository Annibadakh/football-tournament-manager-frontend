import { Component } from "react";
import { TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";

// Catches render crashes so one broken screen doesn't blank the whole app
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // TODO: report to error monitoring (Sentry) in Phase 8
    console.error("Render error", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-red-50 text-danger dark:bg-red-950">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl text-fg">Something went wrong</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Please reload the page. If it keeps happening, contact support.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}

export default ErrorBoundary;
