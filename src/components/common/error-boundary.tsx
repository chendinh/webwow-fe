"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. If omitted, shows the default Vietnamese error message. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for development — in production wire to an error tracking service
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-red-100 bg-red-50 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-red-700">
              Đã có lỗi xảy ra
            </h2>
            <p className="text-sm text-red-600">
              Vui lòng thử lại. Nếu lỗi vẫn tiếp tục, hãy liên hệ bộ phận hỗ trợ.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
