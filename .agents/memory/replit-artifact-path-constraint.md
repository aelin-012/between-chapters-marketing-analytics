---
name: Replit artifact path-based ID constraint and stub workaround
description: Why artifacts with path-based IDs can't move, and the stub pattern that enables frontend/backend top-level folders
---

## Rule
Artifacts with path-based IDs (e.g. `id = "artifacts/portfolio"`) CANNOT be moved out of `artifacts/<slug>/` — the proxy hardcodes the ID as the filesystem path for artifact.toml lookup. UUID-based artifact IDs (e.g. `id = "3B4_FFSkEVBkAeYMFRJ2e"`) can be registered to any directory via verifyAndReplaceArtifactToml.

## Workaround: Stub pattern (CONFIRMED WORKING)
To give users `frontend/` and `backend/` folders at the root:

1. Keep `artifacts/portfolio/` and `artifacts/api-server/` as thin stubs — containing ONLY `.replit-artifact/artifact.toml`. Strip all source files with `ls | grep -v '\.replit-artifact' | xargs rm -rf`. pnpm ignores dirs without `package.json`.
2. Create `frontend/` and `backend/` as real pnpm workspace packages (`@workspace/frontend`, `@workspace/backend`).
3. Update stub artifact.toml run/build commands to use new package names and paths (`frontend/dist/public`, `backend/dist/index.mjs`).
4. Add `frontend` and `backend` to pnpm-workspace.yaml packages (keep `artifacts/*` for mockup-sandbox etc.).
5. Fix tsconfig paths — one level shallower: `../../tsconfig.base.json` → `../tsconfig.base.json`, same for lib references.
6. Delete stale node_modules before `pnpm install` to avoid broken relative symlinks.
7. Kill orphaned processes on ports before restarting workflows (use /proc/net/tcp inode lookup + kill -9 PID).

## Why symlinks don't work
Pointing `artifacts/portfolio` → `frontend/` as a symlink does NOT work. The proxy needs a real directory with the artifact.toml stub.

## How to apply
Use the stub pattern when user wants `frontend/backend` top-level structure. Do NOT delete the stub dirs — proxy shows "no previewable artifacts" without them.
