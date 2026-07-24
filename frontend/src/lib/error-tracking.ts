interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

class ErrorTracker {
  private dsn: string | null;
  private queue: ErrorReport[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.dsn = import.meta.env.VITE_SENTRY_DSN || null;
    if (this.dsn) {
      this.flushInterval = setInterval(() => this.flush(), 30000);
    }
  }

  captureError(error: Error, extra?: Record<string, unknown>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      extra,
    };

    if (this.dsn) {
      this.queue.push(report);
      if (this.queue.length >= 10) this.flush();
    }

    console.error("[ErrorTracker]", error.message, extra);
  }

  captureComponentError(error: Error, componentStack: string) {
    this.captureError(error, { componentStack });
  }

  setUser(userId: string) {
    this.userId = userId;
  }

  private userId?: string;

  private async flush() {
    if (this.queue.length === 0 || !this.dsn) return;

    const reports = this.queue.splice(0);
    try {
      await fetch(this.dsn, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: reports.map((r) => ({
            ...r,
            userId: this.userId,
          })),
        }),
      });
    } catch {
      this.queue.unshift(...reports);
    }
  }

  destroy() {
    if (this.flushInterval) clearInterval(this.flushInterval);
    this.flush();
  }
}

export const errorTracker = new ErrorTracker();

export function setupGlobalErrorHandlers() {
  window.addEventListener("error", (event) => {
    errorTracker.captureError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    errorTracker.captureError(
      reason instanceof Error ? reason : new Error(String(reason)),
      { type: "unhandledrejection" }
    );
  });
}
