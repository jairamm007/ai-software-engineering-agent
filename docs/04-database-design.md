# Database Design

# Database: PostgreSQL + Prisma

---

# Users

Stores user information.

Fields

- id
- name
- email
- password
- createdAt
- updatedAt

---

# Projects

Stores projects created by users.

Fields

- id
- userId
- name
- description
- githubUrl
- createdAt

---

# Repositories

Stores repository metadata.

Fields

- id
- projectId
- branch
- commitHash
- language
- framework

---

# RepositoryFiles

Stores repository file information.

Fields

- id
- repositoryId
- path
- fileType
- size

---

# Embeddings

Stores vector embeddings.

Fields

- id
- repositoryFileId
- embedding
- chunk
- metadata

---

# Chats

Stores chat sessions.

Fields

- id
- userId
- repositoryId
- title
- createdAt

---

# Messages

Stores conversation messages.

Fields

- id
- chatId
- role
- content
- createdAt

---

# GeneratedFiles

Stores AI generated files.

Fields

- id
- repositoryId
- path
- content
- createdAt

---

# AgentLogs

Stores agent execution history.

Fields

- id
- agent
- task
- status
- executionTime
- createdAt

---

# Relationships

User

↓

Projects

↓

Repositories

↓

RepositoryFiles

↓

Embeddings

↓

Chats

↓

Messages

↓

GeneratedFiles

↓

AgentLogs