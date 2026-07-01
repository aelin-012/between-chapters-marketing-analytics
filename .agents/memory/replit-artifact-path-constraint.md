---
name: Replit artifact path-based ID constraint
description: Why artifacts with path-based IDs (id = "artifacts/foo") cannot be moved to different directories
---

## Rule
Never attempt to physically move an artifact directory away from `artifacts/<slug>/` when the artifact has a path-based ID (e.g. `id = "artifacts/portfolio"`). The Replit proxy routes traffic by constructing the artifact.toml path from the ID, so the proxy will always look at `artifacts/portfolio/.replit-artifact/artifact.toml` regardless of where `verifyAndReplaceArtifactToml` points the registration.

## Why
- `verifyAndReplaceArtifactToml` CAN update the `artifactDir` registration in Replit's internal DB (confirmed by `listArtifacts()` showing the new path), but the **proxy layer** ignores this and uses the ID as the literal filesystem path.
- UUID-based IDs (e.g. `id = "3B4_FFSkEVBkAeYMFRJ2e"`) DO support moving — the backend API server moved to `backend/` successfully.
- Attempting the move causes: symlink depth issues in node_modules, port conflicts from orphaned processes, and a 404 "no previewable artifacts" proxy error.

## How to apply
- If user asks to restructure `artifacts/portfolio` → `frontend/`, explain the Replit constraint and offer to rename within `artifacts/` instead (e.g. `artifacts/frontend`). But that breaks the path-based ID too — only UUID artifacts can move.
- The safest "frontend/backend" naming within Replit: keep `artifacts/` structure, explain that `artifacts/portfolio` IS the frontend and `artifacts/api-server` IS the backend.
- If an artifact was created without a path-based ID (UUID), it CAN be moved to any top-level directory safely.
