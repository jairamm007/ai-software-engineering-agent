import { simpleGit, type SimpleGit } from "simple-git";
import type { InsightTimeline, TimelineEvent } from "../types.js";

export interface TimelineInput {
  localPath: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  moduleFolders: string[];
}

interface CommitRef {
  hash: string;
  date: string;
  message: string;
  author: string;
  email: string;
}

const toISO = (value?: Date | string | null): string | null => {
  if (!value) return null;
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
};

const readCommits = async (git: SimpleGit | null): Promise<CommitRef[]> => {
  if (!git) return [];
  try {
    const log = await git.log({
      maxCount: 500,
      format: {
        hash: "%H",
        date: "%aI",
        message: "%s",
        author_name: "%an",
        author_email: "%ae",
      },
    });
    return (log.all as unknown as CommitRef[]).filter((c) => c && c.date);
  } catch {
    return [];
  }
};

const firstCommitInFolder = async (
  git: SimpleGit | null,
  folder: string
): Promise<CommitRef | null> => {
  if (!git) return null;
  try {
    const log = await git.log({
      maxCount: 1,
      file: folder,
      format: {
        hash: "%H",
        date: "%aI",
        message: "%s",
        author_name: "%an",
        author_email: "%ae",
      },
    });
    const first = log.all[0] as unknown as CommitRef | undefined;
    return first?.date ? first : null;
  } catch {
    return null;
  }
};

const shortMessage = (message: string): string => {
  const clean = message.trim().replace(/\s+/g, " ");
  return clean.length > 60 ? `${clean.slice(0, 57)}...` : clean;
};

const humanize = (name: string): string =>
  name
    .split(/[-_.]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const buildTimeline = async (input: TimelineInput): Promise<InsightTimeline> => {
  const created = toISO(input.createdAt);
  const updated = toISO(input.updatedAt);
  const events: TimelineEvent[] = [];

  if (created) {
    events.push({ type: "created", label: "Repository created", date: created });
  }

  const git = input.localPath
    ? simpleGit({ baseDir: input.localPath, maxConcurrentProcesses: 1, timeout: { block: 10_000 } })
    : null;
  const commits = await readCommits(git);

  if (commits.length === 0) {
    const fallbackDate = created ?? new Date().toISOString();
    return {
      events:
        events.length > 0
          ? events
          : [{ type: "created", label: "Repository created", date: fallbackDate }],
      totalCommits: 0,
      startedAt: created,
      lastActiveAt: updated ?? created,
      contributors: 0,
    };
  }

  const oldest = commits[commits.length - 1];
  const newest = commits[0];
  events.push({
    type: "initial_commit",
    label: "Initial commit",
    date: oldest.date,
    author: oldest.author,
    description: shortMessage(oldest.message),
  });
  events.push({
    type: "last_commit",
    label: "Latest commit",
    date: newest.date,
    author: newest.author,
    description: shortMessage(newest.message),
  });

  for (const commit of commits) {
    if (events.length >= 7) break;
    if (/^(feat|feature|add|init|new)(\(|:|\s)/i.test(commit.message)) {
      events.push({
        type: "milestone",
        label: shortMessage(commit.message),
        date: commit.date,
        author: commit.author,
      });
    }
  }

  for (const folder of input.moduleFolders) {
    if (events.length >= 12) break;
    const first = await firstCommitInFolder(git, folder);
    if (first) {
      events.push({
        type: "module_added",
        label: `Added ${humanize(folder)} module`,
        date: first.date,
        author: first.author,
        description: shortMessage(first.message),
      });
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));

  return {
    events,
    totalCommits: commits.length,
    startedAt: oldest.date,
    lastActiveAt: newest.date,
    contributors: new Set(commits.map((c) => c.email || c.author)).size,
  };
};
