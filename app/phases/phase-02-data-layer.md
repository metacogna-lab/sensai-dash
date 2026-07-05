# Phase 2 — Read-Only Data Layer

**Goal:** The "read-only API server" backbone — every fs read sandboxed, GET-only.

## Deliverables
- `lib/sandbox.ts` — the single chokepoint. `resolveSafe(relPath)` joins under `SENSAI_ROOT`
  (`path.resolve(process.cwd(),'..')` default), rejects `..`/absolute/symlink escape via `realpath`,
  throws `SandboxError` (→ 403) on escape. No write helpers exist here.
- `lib/errors.ts` — `logError(type, err, context)` appends `agents/errors/[ISO]_[TYPE].md`; never throws.
- `lib/fileParser.ts` — `listDir`, `readMarkdown` (gray-matter → `{frontmatter, body}`), `parseLog`
  (pipe-split rows → typed objects). All reads via `sandbox` + guarded by `errors`.
- `lib/pipeline.ts` — ordered phase registry: `{key,label,dir,accent}` for Raw→Nodes→Theories→
  EconModels→Verification→Alignment→Broadcast. Kanban + counts derive from this.
- `lib/dataSource.ts` — `DataSource` interface (`listEngagements`, `getTree`, `readFile`, `getLog`)
  + `FsDataSource` impl. Components depend on the interface, not fs.
- Route handlers (`runtime='nodejs'`, GET only), thin wrappers over `dataSource`:
  - `GET /api/engagements` → tenants + summary counts (nodes/theories/econ) + last-activity.
  - `GET /api/tree?path=` → sandboxed directory listing (name/type/size).
  - `GET /api/file?path=` → `{frontmatter, body, raw}`.
  - `GET /api/log?engagement=` → parsed execution.log rows (newest first).

## Files
`app/src/lib/{sandbox,errors,fileParser,pipeline,dataSource}.ts`,
`app/src/app/api/{engagements,tree,file,log}/route.ts`.

**Done when:** `/api/engagements` lists both tenants; `/api/file?path=../../etc/passwd` → 403.
