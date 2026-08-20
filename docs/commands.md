## Commands

### Typecheck

- **Frontend typecheck**: `cd frontend ; npx tsc --noEmit --pretty`
- **Backend typecheck**: `cd backend ; npx tsc --noEmit --pretty`

### Build

- **Build frontend**: `cd frontend ; npm run build` (runs `tsc -b` + `vite build` → `dist/`)
- **Build backend**: `cd backend ; npm run build` (`tsc` → `dist/`)

### Dev servers

- **Frontend dev server**: `cd frontend ; npm run dev` → http://localhost:5173 (proxies `/api` → :3000)
- **Backend dev server**: `cd backend ; npm run dev` → http://localhost:3000 (`tsx watch src/index.ts`)

### Backend scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`node dist/index.js`) |
| `npm test` | Run Vitest once (`vitest run`) |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:ui` | Run Vitest with the UI dashboard |
| `npm run test:coverage` | Run Vitest with coverage report |
| `npm run test:report` | Run Vitest and emit `test-results.json` |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma migrate dev` | Apply schema changes / run migrations |
| `npx prisma db push` | Push the schema without migrations |
| `node check-db.mjs` | Verify DB connectivity |
| `node check-roles.mjs` | Verify/admin-check user roles |

### Frontend scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run lint` | Run ESLint over the source |
| `npm run preview` | Preview the production build locally |

### Prerequisites

- Git, Node.js (LTS), npm, PostgreSQL
- Docker (optional — used for the pipeline sandbox / security scanner)