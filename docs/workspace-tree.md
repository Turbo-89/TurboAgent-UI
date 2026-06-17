# Workspace Tree

## Purpose

The workspace tree lets the local UI browse configured backend workspace roots, open read-only text files, and preview the selected file in the browser. The chat page uses the currently opened file only as metadata so the backend can decide whether to use its own safe preview feature.

## Backend URL

Set `NEXT_PUBLIC_BACKEND_BASE_URL` for browser-side filesystem requests.

Example:

```env
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
```

If the variable is missing, the UI falls back to `http://localhost:8000`.

## Pages

- `/workspace-test`
  Minimal test page for `WorkspaceTree`. It lists roots, opens files, and shows read-only file content on the right.

- `/chat`
  Main chat page. It shows a left-side read-only `WorkspaceTree`, previews the opened file, allows selecting up to 10 additional context files, and sends chat messages as before.

## Backend Endpoints Used

- `GET /api/fs/roots`
  Loads available workspace root aliases.

- `GET /api/fs/list?root=<alias>&path=<relative-path>`
  Lists folders and files under the selected root.

- `GET /api/fs/read?root=<alias>&path=<relative-path>`
  Reads preview content for a clicked file.

## Chat Metadata

When a file is open or selected as context, `/chat` includes only metadata in the chat request:

```json
{
  "context": {
    "open_file": {
      "root": "marketing_agent",
      "path": "server.py",
      "sha256": "<optional sha256>"
    },
    "selected_files": [
      {
        "root": "turbo_ui",
        "path": "components/WorkspaceTree.tsx",
        "sha256": "<optional sha256>"
      }
    ]
  }
}
```

`open_file` is the active preview file. `selected_files` is a compact metadata-only list of additional context files, limited to 10 entries and deduplicated by `root` plus `path`.

The chat payload must not include file content. The backend may optionally inject a limited server-side preview for `open_file` when `ENABLE_OPEN_FILE_CONTEXT` is enabled, but that is controlled by the backend.

## Safety Rules

- The UI uses root aliases and relative paths only.
- The UI does not send absolute filesystem paths.
- The UI does not provide write, delete, rename, pinning, retrieval, or indexing actions.
- The UI must not send open-file or selected-file content in the chat payload.
- File content is shown only as a local read-only preview after `/api/fs/read`.

## Validation Commands

From the UI repo:

```powershell
npm.cmd run build
```

If PowerShell execution policy allows the npm shim, this is equivalent:

```powershell
npm run build
```
