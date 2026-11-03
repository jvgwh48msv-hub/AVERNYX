-- Structure prévue pour une future livraison sécurisée de rapports.
create table if not exists public.reports (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 submitted_url text not null,
 report_json jsonb,
 created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "Read own reports" on public.reports for select to authenticated using ((select auth.uid()) = user_id);
-- Les insertions doivent être faites uniquement par un backend authentifié et validé.
