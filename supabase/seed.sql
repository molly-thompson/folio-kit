insert into public.site_settings (id, site_name, tagline, description, favicon_path, logo_path, contact_email, contact_subject, contact_message, theme, typography, navigation, default_seo)
values (1, 'FolioKit Demo', 'A portfolio starter with room to make it yours.', 'A deliberately different database-backed demonstration dataset for FolioKit.', 'site/favicon.svg', 'site/logo.svg', 'hello@foliokit.example', 'A new project', 'Tell me what you are making and what matters most.', '{"defaultMode":"light"}', '{"display":"fraunces","body":"manrope","scale":"editorial"}', '{"showAbout":true,"showProjects":true,"showContact":true,"alignment":"left"}', '{"title":"FolioKit Demo","description":"A portfolio starter with room to make it yours.","canonicalPath":"/"}')
on conflict (id) do update set site_name = excluded.site_name, tagline = excluded.tagline, description = excluded.description, updated_at = now();

insert into public.pages (id, slug, title, description, status, display_order)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'home', 'FolioKit Demo', 'A database-backed FolioKit demonstration.', 'published', 0), ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'projects', 'Projects', 'Selected database projects.', 'published', 1)
on conflict (slug) do update set title = excluded.title, description = excluded.description, status = excluded.status;

insert into public.page_sections (page_id, section_key, section_type, variant, display_order, visible, content)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'hero', 'hero', 'split', 0, true, '{"eyebrow":"FolioKit database","title":"Content that travels with the system.","body":"This is intentionally different from the local fallback dataset."}'), ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'hidden-note', 'about', 'default', 1, false, '{"title":"Hidden"}')
on conflict (page_id, section_key) do update set content = excluded.content, visible = excluded.visible;

insert into public.projects (id, slug, title, tagline, summary, overview, cover_image_path, cover_image_alt, featured, status, display_order)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'atlas-notes', 'Atlas Notes', 'A field guide for distributed teams.', 'A workspace for turning observations into shared direction.', 'Atlas Notes pairs structured research with a lightweight editorial system.', 'projects/atlas-notes/cover.svg', 'Indigo map marks on a warm field', true, 'published', 0)
on conflict (id) do update set title = excluded.title, tagline = excluded.tagline, summary = excluded.summary, overview = excluded.overview, cover_image_path = excluded.cover_image_path, status = excluded.status;
