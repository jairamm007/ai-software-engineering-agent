import type { RepositoryFileLite, TechStackItem } from "../types.js";
import {
  pathPrefixInFiles,
  readRepoFile,
  readRepoJson,
} from "../fs.util.js";

export interface TechStackInput {
  localPath: string | null;
  files: RepositoryFileLite[];
}

interface PackageJson {
  name?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const FRONTEND = ["react", "vue", "svelte", "next", "@angular/core", "remix", "@remix-run/react"] as const;
const UI = ["tailwindcss", "@tailwindcss/vite", "antd", "@mui/material", "@emotion/react", "bootstrap", "styled-components", "framer-motion", "shadcn"] as const;
const BACKEND = ["express", "fastify", "koa", "@nestjs/core", "hapi", "hono", "h3", "nest"] as const;
const ORM = ["@prisma/client", "prisma", "typeorm", "sequelize", "knex", "mongoose", "pg", "better-sqlite3", "mysql2", "drizzle-orm"] as const;
const AI = ["@langchain/core", "@langchain/langgraph", "langchain", "openai", "@openai/openai-node", "anthropic", "@anthropic-ai/sdk", "@ai-sdk/react", "ai", "@google/generative-ai", "langgraph", "@google/genai"] as const;
const VECTOR = ["@pinecone-database/pinecone", "chromadb", "@qdrant/js-client-rest", "weaviate-ts-client", "@pgvector/pg"] as const;
const TESTING = ["vitest", "jest", "@testing-library/react", "playwright", "cypress", "mocha", "@vitest/coverage-v8"] as const;
const TOOLING = ["typescript", "eslint", "prettier", "esbuild", "vite", "webpack", "rollup", "turborepo", "nx"] as const;
const STATE = ["zustand", "redux", "@reduxjs/toolkit", "mobx", "jotai"] as const;
const HTTP = ["axios", "@tanstack/react-query", "react-query"] as const;
const VALIDATION = ["zod", "yup", "joi"] as const;
const MISC = ["dotenv", "cron", "socket.io", "ws", "resend", "nodemailer", "graphql", "@apollo/client"] as const;

type DepMap = Record<string, string>;

const findDeps = (deps: DepMap, keys: readonly string[]): string | undefined =>
  keys.find((k) => deps[k] !== undefined);

const toStack = (
  deps: DepMap,
  keys: readonly string[],
  category: string,
  display?: (key: string) => string
): TechStackItem[] =>
  keys
    .filter((k) => deps[k] !== undefined)
    .map((k) => ({ name: display ? display(k) : k, category, version: deps[k] }));

export const detectFrontendFramework = (deps: DepMap): string | null => {
  const found = findDeps(deps, FRONTEND);
  if (!found) return null;
  if (found === "next") return "Next.js";
  if (found === "@angular/core") return "Angular";
  if (found === "@remix-run/react" || found === "remix") return "Remix";
  return found.charAt(0).toUpperCase() + found.slice(1);
};

export const detectBackendFramework = (deps: DepMap): string | null => {
  const found = findDeps(deps, BACKEND);
  if (!found) return null;
  if (found === "@nestjs/core") return "NestJS";
  if (found === "express") return "Express";
  if (found === "fastify") return "Fastify";
  if (found === "koa") return "Koa";
  if (found === "hono") return "Hono";
  return found;
};

export const detectDatabase = (deps: DepMap, prismaSchema: string | null): string | null => {
  if (prismaSchema) {
    if (prismaSchema.includes("postgresql")) return "PostgreSQL";
    if (prismaSchema.includes("mysql")) return "MySQL";
    if (prismaSchema.includes("sqlite")) return "SQLite";
  }
  const orm = findDeps(deps, ORM);
  if (orm === "pg" || orm === "@prisma/client" || orm === "prisma" || orm === "drizzle-orm") return "PostgreSQL";
  if (orm === "mongoose") return "MongoDB";
  if (orm === "mysql2") return "MySQL";
  if (orm === "better-sqlite3") return "SQLite";
  return null;
};

export const detectVectorDb = (deps: DepMap, prismaSchema: string | null): string | null => {
  const dep = findDeps(deps, VECTOR);
  if (dep === "@pgvector/pg") return "pgvector";
  if (dep === "@pinecone-database/pinecone") return "Pinecone";
  if (dep === "chromadb") return "Chroma";
  if (dep === "@qdrant/js-client-rest") return "Qdrant";
  if (dep === "weaviate-ts-client") return "Weaviate";
  if (prismaSchema && prismaSchema.includes("pgvector")) return "pgvector";
  return null;
};

export const detectAiFramework = (deps: DepMap): string | null => {
  const found = findDeps(deps, AI);
  if (!found) return null;
  if (found === "@langchain/langgraph" || found === "langgraph") return "LangGraph";
  if (found === "@langchain/core" || found === "langchain") return "LangChain";
  if (found === "openai" || found === "@openai/openai-node") return "OpenAI";
  if (found === "anthropic" || found === "@anthropic-ai/sdk") return "Anthropic";
  if (found === "@google/genai" || found === "@google/generative-ai") return "Google Gemini";
  if (found === "@ai-sdk/react" || found === "ai") return "Vercel AI SDK";
  return found;
};

const IMAGE_CATEGORY: Record<string, string> = {
  postgres: "database",
  "pgvector/pgvector": "vector_database",
  mysql: "database",
  mariadb: "database",
  mongo: "database",
  redis: "cache",
  memcached: "cache",
  rabbitmq: "message_queue",
  "bitnami/kafka": "message_queue",
  elasticsearch: "search",
  minio: "storage",
};

export const detectTechStack = (input: TechStackInput): TechStackItem[] => {
  const stack: TechStackItem[] = [];
  const pkg = readRepoJson<PackageJson>(input.localPath, "package.json");
  const deps: DepMap = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
  const prismaSchema = readRepoFile(input.localPath, "prisma/schema.prisma");
  const hasPrismaDir = pathPrefixInFiles(input.files, "prisma/schema.prisma");

  const hasAnyDep = Object.keys(deps).length > 0 || pkg?.name;
  if (hasAnyDep) {
    stack.push(...toStack(deps, FRONTEND, "frontend", (k) =>
      k === "next" ? "Next.js" : k === "@angular/core" ? "Angular" : k === "@remix-run/react" || k === "remix" ? "Remix" : k
    ));
    stack.push(...toStack(deps, UI, "ui"));
    stack.push(...toStack(deps, BACKEND, "backend", (k) => k === "@nestjs/core" ? "NestJS" : k));
    stack.push(...toStack(deps, ORM, "data"));
    stack.push(...toStack(deps, AI, "ai"));
    stack.push(...toStack(deps, VECTOR, "vector_database"));
    stack.push(...toStack(deps, TESTING, "testing"));
    stack.push(...toStack(deps, TOOLING, "tooling"));
    stack.push(...toStack(deps, STATE, "state"));
    stack.push(...toStack(deps, HTTP, "http"));
    stack.push(...toStack(deps, VALIDATION, "validation"));
    stack.push(...toStack(deps, MISC, "misc"));
  }

  if (prismaSchema || hasPrismaDir) {
    stack.push({ name: "Prisma ORM", category: "data" });
    const db = detectDatabase(deps, prismaSchema);
    if (db && !stack.some((s) => s.name === db)) stack.push({ name: db, category: "database" });
    const vector = detectVectorDb(deps, prismaSchema);
    if (vector && !stack.some((s) => s.name === vector)) stack.push({ name: vector, category: "vector_database" });
  }

  const docker = readRepoFile(input.localPath, "docker-compose.yml") ?? readRepoFile(input.localPath, "docker-compose.yaml");
  if (docker) {
    const images = docker.match(/image:\s*["']?([a-zA-Z0-9._/-]+)[:"']?/g) ?? [];
    const seen = new Set<string>();
    for (const raw of images) {
      const name = raw.replace(/^image:\s*["']?/, "").replace(/[:"'"].*$/, "").trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      const base = name.split("/").pop()!.split(":")[0].toLowerCase();
      const category = IMAGE_CATEGORY[base] ?? IMAGE_CATEGORY[name.toLowerCase()] ?? "infrastructure";
      stack.push({ name: base, category });
    }
  }

  const unique = new Map<string, TechStackItem>();
  for (const item of stack) {
    const key = `${item.category}:${item.name.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, item);
  }
  return [...unique.values()];
};
