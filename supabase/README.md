# Supabase setup

The SQL in this directory is the reproducible source of truth for FolioKit's portfolio schema.

1. Review `migrations/20261106000000_create_portfolio_schema.sql`.
2. Confirm the target development project before applying it.
3. Apply the migration through the available Supabase integration or the project's approved migration workflow.
4. Run `seed.sql` only after reviewing its upsert behavior.
5. Upload the documented local/demo assets to `portfolio-media` when using the database dataset.
6. Execute `verify.sql` through the anonymous/public access path and inspect security/performance advisories.

The public application uses only the publishable key. Never expose or commit a service-role key.

The database stores relative paths such as `projects/atlas-notes/cover.svg`. The application resolves these paths through the `portfolio-media` bucket. Local fallback assets use `/assets/...` and do not require Supabase.
