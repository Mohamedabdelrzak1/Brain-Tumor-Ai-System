## Brain Tumor AI System (Monorepo)

### Quick start (Windows)

From the repo root:

```powershell
pnpm install
pnpm dev
```

Defaults (no env required):
- **Web**: `http://localhost:5173` (Vite)
- **API**: `http://localhost:3000` (Express)

### Optional environment variables

- **Web** (`apps/web`):
  - `PORT` (default: `5173`)
  - `BASE_PATH` (default: `/`)
- **API** (`apps/api`):
  - `PORT` (default: `3000`)

### Architecture

- **Frontend**: Feature-Sliced Design (FSD) scaffold in `apps/web/src/{app,shared}`
- **Backend**: Clean Architecture scaffold via HTTP composition in `apps/api/src/app/http`

