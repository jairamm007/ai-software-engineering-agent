import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Play } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createRun } from "@/services/pipeline";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function NewRunPage() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createRun({
        repoUrl: repoUrl.trim(),
        branch: branch.trim() || undefined,
      }),
    onSuccess: (run) => {
      toast.success("Run queued");
      navigate(`/runs/${run.id}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to start run");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      toast.error("Repository URL is required");
      return;
    }
    mutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-xl space-y-5">
        <button
          type="button"
          onClick={() => navigate("/runs")}
          className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Back to runs
        </button>

        <div>
          <h1 className="text-2xl font-bold">New Run</h1>
          <p className="text-sm text-slate-500">
            Point the pipeline at a repository to run tests, diagnose failures, generate and apply a
            patch, then run the security gate and performance check.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="repoUrl">
                Repository URL <span className="text-rose-500">*</span>
              </label>
              <Input
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo.git"
                autoFocus
              />
              <p className="mt-1 text-xs text-slate-500">
                HTTPS, SSH, or a local file:// path to a git repository.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="branch">
                Branch or commit SHA
              </label>
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main (defaults to the repository default branch)"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-2"
              >
                {mutation.isPending ? (
                  <LoadingIndicator size="sm" />
                ) : (
                  <Play size={16} />
                )}
                {mutation.isPending ? "Starting…" : "Start Run"}
              </Button>
              <p className="text-xs text-slate-500">
                Runs the strict pipeline and can take several minutes.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
