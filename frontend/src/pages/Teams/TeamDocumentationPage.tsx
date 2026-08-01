import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Trash2, Edit3, X, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTeamDocuments, createTeamDocument, updateTeamDocument, deleteTeamDocument } from "@/services/team";
import type { Team, SharedDocument, TeamRole } from "@/types/team";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface OutletContext {
  team: Team;
  myRole: TeamRole;
}

function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function TeamDocumentationPage() {
  const { team, myRole } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const isMember = myRole !== "viewer";
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingDoc, setEditingDoc] = useState<SharedDocument | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["team-docs", team.id],
    queryFn: () => getTeamDocuments(team.id),
  });

  const createMutation = useMutation({
    mutationFn: () => createTeamDocument(team.id, newTitle, newContent || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-docs", team.id] });
      setShowCreate(false);
      setNewTitle("");
      setNewContent("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateTeamDocument(team.id, editingDoc!.id, { title: editTitle, content: editContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-docs", team.id] });
      setEditingDoc(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => deleteTeamDocument(team.id, docId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-docs", team.id] }),
  });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className={`text-lg font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
            Documentation
          </h1>
          <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {docs.length} documents
          </p>
        </div>
        {isMember && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white"
          >
            <Plus size={13} />
            New Document
          </button>
        )}
      </motion.div>

      {/* Create Dialog */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`rounded-2xl border p-4 space-y-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"}`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>New Document</h3>
              <button type="button" onClick={() => setShowCreate(false)} className={`rounded-lg p-1 ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}>
                <X size={13} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Document title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors ${
                isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
              }`}
            />
            <textarea
              placeholder="Content (markdown supported)"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors resize-none ${
                isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
              }`}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                disabled={!newTitle.trim() || createMutation.isPending}
                className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {createMutation.isPending ? <LoadingIndicator size="sm" /> : <Check size={13} />}
                Create
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documents List */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingIndicator size="md" />
        </div>
      ) : docs.length === 0 && !showCreate ? (
        <div className={`rounded-2xl border py-16 text-center ${isDark ? "border-white/[0.06] bg-white/[0.01]" : "border-slate-200 bg-slate-50"}`}>
          <FileText size={40} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
          <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No documents yet</p>
          <p className={`text-xs font-[Inter] mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Create your first shared document</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc: SharedDocument) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
            >
              {editingDoc?.id === doc.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm font-[Inter] outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
                    }`}
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm font-[Inter] outline-none resize-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
                    }`}
                  />
                  <div className="flex gap-1">
                    <button onClick={() => updateMutation.mutate()} className="rounded-lg accent-bg-light px-2 py-1 text-xs accent-text">Save</button>
                    <button onClick={() => setEditingDoc(null)} className={`rounded-lg px-2 py-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="shrink-0 accent-text" />
                      <h3 className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                        {doc.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isMember && (
                        <button
                          onClick={() => { setEditingDoc(doc); setEditTitle(doc.title); setEditContent(doc.content || ""); }}
                          className={`rounded p-1 ${isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
                        >
                          <Edit3 size={10} />
                        </button>
                      )}
                      {(doc.authorId === team.ownerId || myRole === "owner" || myRole === "admin") && (
                        <button
                          onClick={() => { if (confirm("Delete this document?")) deleteMutation.mutate(doc.id); }}
                          className="rounded p-1 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  {doc.content && (
                    <p className={`text-xs font-[Inter] line-clamp-3 mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {doc.content}
                    </p>
                  )}
                  <div className={`flex items-center gap-2 text-[10px] font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    <span>by {doc.author?.name || "Unknown"}</span>
                    <span>&middot;</span>
                    <span>{timeAgo(doc.updatedAt)}</span>
                    {doc.status && doc.status !== "draft" && (
                      <>
                        <span>&middot;</span>
                        <span className="text-emerald-400">{doc.status}</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
