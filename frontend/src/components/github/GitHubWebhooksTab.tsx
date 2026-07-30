import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Webhook,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  ExternalLink,
  Filter,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { listGitHubWebhookEvents } from "@/services/github-integration";
import type { GitHubWebhookEvent } from "@/types/github-integration";

interface GitHubWebhooksTabProps {
  integrationId: string;
  timeAgo: (d: string | Date) => string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const EVENT_ICONS: Record<string, typeof Webhook> = {
  push: GitCommit,
  pull_request: GitPullRequest,
  issues: AlertCircle,
  issue_comment: MessageSquare,
  pull_request_review: CheckCircle,
  check_run: RotateCw,
  workflow_run: RotateCw,
};

function MessageSquare(props: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size ?? 24} height={props.size ?? 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function GitHubWebhooksTab({ integrationId, timeAgo, autoRefresh = false, refreshInterval = 15000 }: GitHubWebhooksTabProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<GitHubWebhookEvent | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["github-webhook-events", integrationId, eventFilter],
    queryFn: () =>
      listGitHubWebhookEvents(integrationId, {
        eventType: eventFilter === "all" ? undefined : eventFilter,
        perPage: 50,
      }),
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const events = data?.events ?? [];

  const eventTypes = ["all", ...new Set(events.map((e) => e.eventType))];

  const getEventIcon = (eventType: string) => {
    const Icon = EVENT_ICONS[eventType] ?? Webhook;
    return <Icon size={14} />;
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "push": return "text-blue-400";
      case "pull_request": return "text-emerald-400";
      case "issues": case "issue_comment": return "text-yellow-400";
      case "check_run": case "workflow_run": return "text-purple-400";
      default: return "text-slate-400";
    }
  };

  const getStatusColor = (processedAt: string | null) => {
    return processedAt
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-yellow-500/10 text-yellow-400";
  };

  if (selectedEvent) {
    return (
      <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} isDark={isDark} timeAgo={timeAgo} getEventIcon={getEventIcon} getEventColor={getEventColor} />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-2">
          {eventTypes.map((et) => (
            <button
              key={et}
              onClick={() => setEventFilter(et)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                eventFilter === et
                  ? "bg-[var(--accent)] text-white"
                  : isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {et === "all" && <Filter size={12} />}
              {et === "all" ? "All" : et.replace("_", " ")}
            </button>
          ))}
        </div>
        <span className={`self-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {data?.total ?? 0} event{(data?.total ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <Webhook size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No webhook events received yet</p>
          <p className={`mt-1 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            Configure your GitHub repository to send webhooks to <code className={`rounded px-1 py-0.5 font-mono ${isDark ? "bg-white/5" : "bg-slate-100"}`}>/api/webhooks/github</code>
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelectedEvent(event)}
              className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`${getEventColor(event.eventType)}`}>
                {getEventIcon(event.eventType)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    {event.eventType.replace("_", " ")}
                  </span>
                  {event.action && (
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{event.action}</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className={isDark ? "text-slate-500" : "text-slate-400"}>
                    {event.repositoryOwner}/{event.repositoryName}
                  </span>
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(event.createdAt)}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getStatusColor(event.processedAt)}`}>
                    {event.processedAt ? "processed" : "pending"}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Event Detail sub-component ──
function EventDetail({ event, onBack, isDark, timeAgo, getEventIcon, getEventColor }: {
  event: GitHubWebhookEvent;
  onBack: () => void;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
  getEventIcon: (eventType: string) => React.ReactNode;
  getEventColor: (eventType: string) => string;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <button type="button" onClick={onBack} className={`flex items-center gap-1.5 text-sm font-medium ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
        ← Back to Events
      </button>

      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={getEventColor(event.eventType)}>
              {getEventIcon(event.eventType)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {event.eventType.replace("_", " ")}
                </span>
                {event.action && (
                  <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{event.action}</span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs">
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                  {event.repositoryOwner}/{event.repositoryName}
                </span>
                <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(event.createdAt)}</span>
                {event.deliveryId && (
                  <span className={`font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>delivery: {event.deliveryId.slice(0, 12)}...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className={`mb-2 text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Payload</h4>
          <pre className={`max-h-96 overflow-auto rounded-xl p-4 text-xs font-mono leading-relaxed ${
            isDark ? "bg-black/40 text-slate-300" : "bg-slate-50 text-slate-700"
          }`}>
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}
