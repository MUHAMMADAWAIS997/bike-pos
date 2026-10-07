<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
Develop the current Next.js page as a production-ready, desktop-first
Tauri page while following the existing project architecture, design
system, components, and conventions.

Architecture: Next.js/React/TypeScript → Tauri Commands → Rust → SQLite

- Keep UI, state, forms, and client validation in Next.js.
- Keep native/database operations in Tauri/Rust. Do not access SQLite
  directly from React.
- Inspect and reuse existing components, hooks, utilities, types,
  schemas, services, and Tauri commands before creating anything.
- Use components/ui for UI elements. If a reusable component is
  missing, create it once in the appropriate components folder and
  reuse it. Follow DRY and SOLID.
- Keep components focused and avoid unnecessary abstractions,
  dependencies, or restructuring.
- Make the page desktop-first for Tauri, while keeping it reasonably
  responsive for web.
- Match the existing UI style, spacing, typography, colors, and design
  tokens.

Validation must be complete: - Required fields, types, formats, lengths,
ranges, enums, IDs, cross-field rules, and business rules. - Use the
existing validation system (such as Zod) and avoid duplicated validation
logic. - Important business/data validation must also be enforced at the
Rust/database boundary.

Handle all async operations with proper loading, disabled,
duplicate-submit prevention, success, error, and empty states. Protect
destructive actions with confirmation.

Keep database/business logic outside React components: Component →
Hook/Service → Tauri Command → Rust → SQLite

Use strict TypeScript, avoid any where possible, reuse existing types,
and handle Tauri/Rust/SQLite errors cleanly.

Preserve existing routes, functionality, commands, database contracts,
and behavior unless a change is required.

Before finishing, verify the page works correctly, validation is
complete, accessibility and keyboard interaction are handled, no
reusable code is duplicated, and applicable TypeScript, lint, tests, and
build checks pass.

<!-- END:nextjs-agent-rules -->
