-- Run these checks through the anonymous/public API role, not a service-role connection.
select id, site_name from public.site_settings where id = 1;
select slug, status from public.pages order by display_order, id;
select p.slug, s.section_key from public.page_sections s join public.pages p on p.id = s.page_id where p.status = 'published' and s.visible order by p.display_order, s.display_order, s.id;
select slug, status from public.projects where status = 'published' order by display_order, id;
select count(*) as visible_technologies from public.technologies where visible;
select count(*) as visible_skills from public.skills where visible;
select count(*) as visible_social_links from public.social_links where visible;
select id, name, public from storage.buckets where id = 'portfolio-media';
