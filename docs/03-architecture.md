# AI Software Engineering Agent Architecture

# High Level Architecture

                    User
                      │
                      │
         React + TypeScript Frontend
                      │
               Express.js Backend
                      │
              LangGraph Orchestrator
                      │
 ┌──────────┬──────────┬──────────┬──────────┐
 │          │          │          │
Planner  Repository  Coding   Documentation
 Agent      Agent      Agent        Agent
 │          │          │          │
 └──────────┴──────────┴──────────┘
                │
          Tool Calling Layer
                │
 ┌────────┬────────┬────────┬─────────┐
 │        │        │        │
GitHub   File    Terminal  Database
 API    System              Service
                │
          Repository Parser
                │
          Embedding Generator
                │
             PGVector
                │
            Retriever
                │
        Groq / Gemini Models
                │
          Final AI Response

---

# Request Flow

User

↓

Frontend

↓

Backend API

↓

LangGraph Planner

↓

Select Required Agents

↓

Execute Tools

↓

Retrieve Context (RAG)

↓

LLM

↓

Return Response

---

# Agent Responsibilities

Planner Agent

- Understand user intent
- Select required agents
- Manage workflow

Repository Agent

- Clone repository
- Read files
- Parse folders
- Search source code

Coding Agent

- Generate code
- Modify code
- Explain code

Documentation Agent

- Generate README
- API Documentation
- Setup Guide

Future Agents

- Code Review Agent
- Testing Agent
- Bug Detection Agent
- Deployment Agent

---

# Technology Flow

Frontend

↓

Express API

↓

LangGraph

↓

Agents

↓

Tools

↓

RAG

↓

LLM

↓

Response

---

# AI Models

Planner Agent

→ Gemini

Repository Agent

→ Groq

Coding Agent

→ Groq

Documentation Agent

→ Gemini

---

# Future Architecture

Authentication

↓

Projects

↓

Repositories

↓

Agents

↓

Memory

↓

RAG

↓

Analytics

↓

Deployment