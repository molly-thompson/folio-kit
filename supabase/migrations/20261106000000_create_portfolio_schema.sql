create extension if not exists pgcrypto;

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null,
  tagline text not null,
  description text not null,
  favicon_path text,
  logo_path text,
  contact_email text not null,
  contact_subject text not null,
  contact_message text not null,
  theme jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  navigation jsonb not null default '{}'::jsonb,
  default_seo jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('home', 'about', 'projects', 'contact')),
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo jsonb not null default '{}'::jsonb,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  variant text not null,
  display_order integer not null default 0 check (display_order >= 0),
  visible boolean not null default true,
  presentation jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  tagline text not null,
  summary text not null,
  overview text not null,
  cover_image_path text,
  cover_image_alt text,
  repository_url text,
  live_url text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  display_order integer not null default 0 check (display_order >= 0),
  details jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.technologies (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  category text, visible boolean not null default true, display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.skills (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  category text, visible boolean not null default true, display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);
create table public.project_skills (
  project_id uuid not null references public.projects(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (project_id, skill_id)
);
create table public.social_links (
  id uuid primary key default gen_random_uuid(), platform text not null, label text not null,
  url text not null, icon_identifier text not null, display_order integer not null default 0 check (display_order >= 0),
  visible boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index page_sections_page_order_idx on public.page_sections (page_id, display_order, id);
create index projects_public_order_idx on public.projects (status, display_order, id);
create index taxonomy_visible_order_idx on public.technologies (visible, display_order, id);
create index skills_visible_order_idx on public.skills (visible, display_order, id);
create index social_links_visible_order_idx on public.social_links (visible, display_order, id);

create or replace function public.protect_home_page() returns trigger language plpgsql as $$
begin
  if (tg_op = 'DELETE' and old.slug = 'home') or (tg_op = 'UPDATE' and old.slug = 'home' and (new.slug <> 'home' or new.status <> 'published')) then
    raise exception 'The published home page is required';
  end if;
  return coalesce(new, old);
end;
$$;
create trigger protect_home_page before update or delete on public.pages for each row execute function public.protect_home_page();

alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.projects enable row level security;
alter table public.technologies enable row level security;
alter table public.skills enable row level security;
alter table public.project_technologies enable row level security;
alter table public.project_skills enable row level security;
alter table public.social_links enable row level security;

create policy "public reads settings" on public.site_settings for select to anon using (id = 1);
create policy "public reads published pages" on public.pages for select to anon using (status = 'published');
create policy "public reads visible published sections" on public.page_sections for select to anon using (visible and exists (select 1 from public.pages p where p.id = page_id and p.status = 'published'));
create policy "public reads published projects" on public.projects for select to anon using (status = 'published');
create policy "public reads visible technologies" on public.technologies for select to anon using (visible);
create policy "public reads visible skills" on public.skills for select to anon using (visible);
create policy "public reads published project technologies" on public.project_technologies for select to anon using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published') and exists (select 1 from public.technologies t where t.id = technology_id and t.visible));
create policy "public reads published project skills" on public.project_skills for select to anon using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published') and exists (select 1 from public.skills s where s.id = skill_id and s.visible));
create policy "public reads visible social links" on public.social_links for select to anon using (visible);

insert into storage.buckets (id, name, public) values ('portfolio-media', 'portfolio-media', true) on conflict (id) do update set public = excluded.public;
create policy "public reads portfolio media" on storage.objects for select to anon using (bucket_id = 'portfolio-media');
