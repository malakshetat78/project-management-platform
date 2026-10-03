# Intelligent Connected Vehicle Safety Platform — Project Workspace

A team workspace that preserves the graduation project journey: plans, assignments, work updates, reviews, decisions, files, and progress.

## Features

- Individual password-based accounts, secure server-side sessions, logout and temporary-password replacement.
- Backend RBAC: Admins manage project work and accounts; Members create tasks and update tasks they created or are assigned to.
- Task assignment, dates, duration, priority, progress, blockers, results, comments and permanent task history.
- Weekly plans, immutable review snapshots, work updates and audited carry-forward between weeks.
- Monthly goals, milestones, an editable roadmap, a database-driven timeline and project stages.
- Meeting agendas, attendees, MOMs, decisions, problems and idempotent conversion of action items into tasks.
- Protected PDF/DOCX/XLSX/PNG/JPG uploads, document metadata, version history and task/review/update evidence.
- Global activity history, project search, in-app notifications and project-level analytics without personal rankings.
- Multi-page project history PDF with plans, reviews, decisions, task results, document index and activity.

## User roles

**Malak — Admin** and **Shahy — Admin** are the two initial administrators. Both accounts are protected against disabling and demotion. No passwords are included in this repository. First-time activation sets their emails and separate passwords.

Members can view shared team project records, create tasks and update their own tasks, add weekly updates and comments, and upload work evidence. Administrative operations are checked on the server on every request.

## Tech stack

- React 19, TypeScript, Vinext and Vite.
- Shadcn/Radix UI primitives, Lucide icons and Tailwind CSS.
- Cloudflare Workers for the backend.
- Cloudflare D1/SQLite for relational data, Drizzle for migrations.
- Cloudflare R2 for persistent document bytes.
- Web Crypto PBKDF2-SHA256 password hashes and cryptographically random, hashed server sessions.
- A dependency-free, paginated PDF writer for English project reports.

## Architecture

Public visitor → Login → authenticated session → server permission checks → D1 / protected R2 access.

The website is public; all project-data APIs require authentication. Admin pages and management operations require the Admin role. Uploaded files are downloaded through authenticated server endpoints rather than public bucket URLs.

Cookies are HttpOnly, Secure in production and SameSite=Strict. State-changing requests also validate the request origin. Login attempts are rate limited per IP/username pair. Temporary passwords must be replaced before workspace access. Role changes, disabling an account and password resets revoke existing sessions.

## Database

`db/schema.ts` defines users, sessions, login attempts, tasks, comments, weekly/monthly plans, reviews, updates, milestones, stages, meetings, attendees, actions, documents, activity logs, notifications and project settings. Roles are stored on users. Task history is the task-filtered permanent activity log. Relationships use foreign keys. `drizzle/` contains schema-only SQL migrations.

Tasks are archived rather than erased, preserving their files, comments and history. Reviews are immutable snapshots. Project progress is the mean progress of non-archived tasks; weekly completion uses task completion timestamps. Overdue and upcoming deadline notifications are generated when the authenticated workspace loads, deduplicated in D1. Notifications are in-app, not email/push notifications.

## Installation and local development

Use Node.js 22.13 or later and the committed pnpm lockfile:

```sh
pnpm install --frozen-lockfile
cp .env.example .dev.vars
# Replace the placeholder BOOTSTRAP_TOKEN with a random 32-byte hex token.
pnpm build
# Apply each pending migration once to your local D1 database:
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_absent_spencer_smythe.sql
pnpm dev
```

The local database and bucket are Cloudflare emulations. Production uses separately provisioned D1 and R2 resources. Never copy a development database into production.

## Environment variables and activation

`BOOTSTRAP_TOKEN` is a secret random token used only for first-time activation. Store it in the hosting environment; locally use ignored `.dev.vars`. Never commit it.

Configure `BOOTSTRAP_OWNER_EMAIL` with the Site owner's ChatGPT account email. Open `/setup` once with that ChatGPT account and enter both administrators' emails and new passwords. The setup page verifies the owner on the server. Activation is one-time. A secret bootstrap token is also supported for controlled server setup and the isolated integration suite; never share or commit it. The two accounts can then log in using their emails or usernames `malak` and `shahy`. Share each person's password privately with that person.

Team members can sign up with their full name, email, password and confirmation. All signups are Members; only the two protected accounts, Malak and Shahy, are Admins. Admins add team accounts with temporary passwords or reset existing passwords. Email invitations and self-service forgotten-password emails are not configured; password recovery is admin-assisted. Members may change their display profile and password.

## Files and storage

Uploads are limited to 15 MB and the supported extensions. The server validates file signatures, enforces authentication and task-ownership checks, and stores metadata in D1 and bytes in R2. Downloads use attachment headers and `nosniff`. New versions preserve earlier files. The server does not execute or unpack uploaded files.

## Validation

```sh
pnpm exec tsc --noEmit
pnpm build
node tests/integration.mjs
```

The integration suite runs the actual built Worker against disposable Miniflare D1/R2 instances. It covers anonymous access, origin checks, admin activation, both admins, Member RBAC, temporary-password replacement, tasks, reviews, work updates, carry-forward, meeting conversion, document upload/retrieval/versioning, invalid uploads, archiving, PDF generation, notifications, logout, persistence and disabled sessions. It does not create production accounts or test data.

## Deployment

The `.openai/hosting.json` manifest declares logical bindings `DB` and `BUCKET`. Sites provisions their production resources, applies migrations and deploys the Worker output in `dist/server`. Configure `BOOTSTRAP_TOKEN` as a production secret, publish the built version, and set the Site audience to public. App authentication protects the workspace.

Keep `.env`, `.dev.vars`, passwords, tokens, database contents, bucket contents and generated runtime files out of source control. Keep backups and operational monitoring configured with the hosting provider before treating the workspace as the team's sole archive.

## GitHub repository

Source repository: https://github.com/malakshetat78/project-management-platform (public). The Site source is versioned in the Sites-managed source repository independently of GitHub.

## Scope and operating notes

- Sample data is explicitly opt-in and editable; it is never presented as actual completed work. Sample Ahmed/Sara accounts are disabled until an admin activates them with their real emails and temporary passwords.
- The PDF writer uses the built-in Helvetica font and normalizes non-ASCII characters. Use English for complete PDF text preservation; multilingual embedded-font reports would require a separate font-aware export implementation.
- File scanning, external email delivery, automated scheduled deadline delivery, backups and disaster recovery are not automatically provided by this code. Configure those operational services as needed.
- Browser WebMCP exposes a read-only project search tool when supported; unsupported browsers keep the regular UI.
