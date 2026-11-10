# Supabase integration (work in progress)

Supabase project: `flflsycwpetkupgskikz`

## Current state

- PostgreSQL tables and foreign keys have been provisioned in the private `workspace` schema.
- Private Storage bucket `project-management-files` has been provisioned.
- Document upload and download endpoints on this branch use Supabase Storage.
- **Database queries still use Cloudflare D1**. Do not deploy this branch as a complete Supabase migration.
- Existing authentication, task management, and other API operations have not been migrated or end-to-end tested.

## Worker secrets required for the Storage adapter

Set the following in Cloudflare Workers > Settings > Variables and Secrets:

- `SUPABASE_URL`: `https://flflsycwpetkupgskikz.supabase.co` (non-secret)
- `SUPABASE_SECRET_KEY`: server-only Supabase secret/service-role key; configure as an encrypted secret, never commit or expose in browser code.

The adapter uses a private bucket. It relies on application session checks in document endpoints; never expose the secret key publicly.

## Before production deployment

1. Convert all D1 SQL queries and batching/transaction behavior to PostgreSQL.
2. Configure server-only database credentials, preserving the private schema and backend authorization.
3. Remove D1 and R2 bindings from the generated Worker configuration once the migration is complete.
4. Run TypeScript/build/integration tests, verify sign-in, tasks, document upload/download and rollback handling.
5. Configure backups, error monitoring and initial administrator activation.
