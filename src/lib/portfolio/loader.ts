import { createClient } from "@supabase/supabase-js";
import { env } from "../../env";
import { fallbackPortfolio } from "./fallback";
import {
	type DataDiagnostic,
	linkReferenceSchema,
	mediaReferenceSchema,
	type PortfolioDataset,
	type PortfolioLoadResult,
	pageSchema,
	portfolioDatasetSchema,
	projectSchema,
	sectionSchema,
	siteSettingsSchema,
	skillSchema,
	socialLinkSchema,
	technologySchema,
} from "./schema";

export const portfolioLimits = {
	pages: 4,
	sectionsPerPage: 24,
	projects: 100,
	technologies: 100,
	skills: 100,
	socialLinks: 30,
	projectTechnologyRelationships: 500,
	projectSkillRelationships: 500,
} as const;

const maxSections = portfolioLimits.pages * portfolioLimits.sectionsPerPage;
type Row = Record<string, unknown>;

class PortfolioLoadError extends Error {
	constructor(readonly diagnosticCode: string) {
		super(diagnosticCode);
	}
}

function isRow(value: unknown): value is Row {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rows(value: unknown): Row[] {
	if (!Array.isArray(value) || !value.every(isRow)) {
		throw new PortfolioLoadError("database_invalid");
	}
	return value;
}

function record(value: unknown): Row {
	if (!isRow(value)) {
		throw new PortfolioLoadError("database_invalid");
	}
	return value;
}

function queryRows(
	data: unknown,
	error: { message: string } | null,
	maximum: number,
): Row[] {
	if (error) {
		throw new PortfolioLoadError("database_unavailable");
	}
	const result = rows(data);
	if (result.length > maximum) {
		throw new PortfolioLoadError("dataset_limit_exceeded");
	}
	return result;
}

function queryRecord(data: unknown, error: { message: string } | null): Row {
	if (error) {
		throw new PortfolioLoadError("database_unavailable");
	}
	return record(data);
}

function text(value: unknown): string {
	if (typeof value !== "string") {
		throw new PortfolioLoadError("database_invalid");
	}
	return value;
}

function optionalText(value: unknown): string | undefined {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

function jsonRecord(value: unknown): Row {
	if (value === null || value === undefined) {
		return {};
	}
	return record(value);
}

function diagnostic(
	code: string,
	severity: DataDiagnostic["severity"],
	source: DataDiagnostic["source"],
): DataDiagnostic {
	return { code, severity, source };
}

function fallbackResult(code: string): PortfolioLoadResult {
	return {
		dataset: fallbackPortfolio,
		source: "fallback",
		diagnostics: [diagnostic(code, "warning", "fallback")],
	};
}

function uniqueBy(
	items: Array<{ id: string }>,
	sluggedItems: Array<{ slug: string }>,
) {
	return (
		new Set(items.map(({ id }) => id)).size === items.length &&
		new Set(sluggedItems.map(({ slug }) => slug)).size === sluggedItems.length
	);
}

function normalizeSettings(row: Row) {
	const theme = jsonRecord(row.theme);
	const typography = jsonRecord(row.typography);
	const navigation = jsonRecord(row.navigation);
	const defaultSeo = jsonRecord(row.default_seo);
	const faviconPath = optionalText(row.favicon_path);
	const logoPath = optionalText(row.logo_path);

	return siteSettingsSchema.parse({
		siteName: row.site_name,
		tagline: row.tagline,
		description: row.description,
		...(faviconPath
			? {
					favicon: mediaReferenceSchema.parse({
						source: "storage",
						path: faviconPath,
					}),
				}
			: {}),
		...(logoPath
			? {
					logo: mediaReferenceSchema.parse({
						source: "storage",
						path: logoPath,
					}),
				}
			: {}),
		contactEmail: row.contact_email,
		contactSubject: row.contact_subject,
		contactMessage: row.contact_message,
		theme,
		typography,
		defaultSeo,
		navigation,
	});
}

export async function loadPortfolioFromDatabase(
	url: string,
	anonymousKey: string,
	fetcher: typeof fetch = fetch,
): Promise<PortfolioLoadResult> {
	const client = createClient(url, anonymousKey, {
		auth: {
			autoRefreshToken: false,
			detectSessionInUrl: false,
			persistSession: false,
		},
		global: { fetch: fetcher },
	});
	const [
		settingsResult,
		pagesResult,
		projectsResult,
		technologiesResult,
		skillsResult,
		socialLinksResult,
	] = await Promise.all([
		client
			.from("site_settings")
			.select(
				"site_name,tagline,description,favicon_path,logo_path,contact_email,contact_subject,contact_message,theme,typography,navigation,default_seo",
			)
			.eq("id", 1)
			.maybeSingle(),
		client
			.from("pages")
			.select("id,slug,title,description,seo,display_order")
			.eq("status", "published")
			.order("display_order")
			.order("id")
			.limit(portfolioLimits.pages + 1),
		client
			.from("projects")
			.select(
				"id,slug,title,tagline,summary,overview,cover_image_path,cover_image_alt,repository_url,live_url,featured,display_order",
			)
			.eq("status", "published")
			.order("display_order")
			.order("id")
			.limit(portfolioLimits.projects + 1),
		client
			.from("technologies")
			.select("id,name,slug,category,display_order")
			.eq("visible", true)
			.order("display_order")
			.order("id")
			.limit(portfolioLimits.technologies + 1),
		client
			.from("skills")
			.select("id,name,slug,category,display_order")
			.eq("visible", true)
			.order("display_order")
			.order("id")
			.limit(portfolioLimits.skills + 1),
		client
			.from("social_links")
			.select("id,platform,label,url,icon_identifier,display_order")
			.eq("visible", true)
			.order("display_order")
			.order("id")
			.limit(portfolioLimits.socialLinks + 1),
	]);

	if (settingsResult.error) {
		throw new PortfolioLoadError("database_unavailable");
	}
	if (!settingsResult.data) {
		throw new PortfolioLoadError("settings_missing");
	}
	const settingsRow = queryRecord(settingsResult.data, null);
	const pageRows = queryRows(
		pagesResult.data,
		pagesResult.error,
		portfolioLimits.pages,
	);
	const projectRows = queryRows(
		projectsResult.data,
		projectsResult.error,
		portfolioLimits.projects,
	);
	const technologyRows = queryRows(
		technologiesResult.data,
		technologiesResult.error,
		portfolioLimits.technologies,
	);
	const skillRows = queryRows(
		skillsResult.data,
		skillsResult.error,
		portfolioLimits.skills,
	);
	const socialLinkRows = queryRows(
		socialLinksResult.data,
		socialLinksResult.error,
		portfolioLimits.socialLinks,
	);

	if (!pageRows.some((page) => page.slug === "home")) {
		throw new PortfolioLoadError("homepage_missing");
	}

	const pageIds = pageRows.map((page) => text(page.id));
	const projectIds = projectRows.map((project) => text(project.id));
	const [sectionsResult, projectTechnologiesResult, projectSkillsResult] =
		await Promise.all([
			client
				.from("page_sections")
				.select(
					"page_id,section_key,section_type,variant,display_order,visible,presentation,content",
				)
				.in("page_id", pageIds)
				.order("display_order")
				.order("id")
				.limit(maxSections + 1),
			projectIds.length
				? client
						.from("project_technologies")
						.select("project_id,technology_id")
						.in("project_id", projectIds)
						.limit(portfolioLimits.projectTechnologyRelationships + 1)
				: Promise.resolve({ data: [], error: null }),
			projectIds.length
				? client
						.from("project_skills")
						.select("project_id,skill_id")
						.in("project_id", projectIds)
						.limit(portfolioLimits.projectSkillRelationships + 1)
				: Promise.resolve({ data: [], error: null }),
		]);

	const sectionRows = queryRows(
		sectionsResult.data,
		sectionsResult.error,
		maxSections,
	);
	const projectTechnologyRows = queryRows(
		projectTechnologiesResult.data,
		projectTechnologiesResult.error,
		portfolioLimits.projectTechnologyRelationships,
	);
	const projectSkillRows = queryRows(
		projectSkillsResult.data,
		projectSkillsResult.error,
		portfolioLimits.projectSkillRelationships,
	);

	const diagnostics: DataDiagnostic[] = [];
	const sectionsByPage = new Map<
		string,
		ReturnType<typeof sectionSchema.parse>[]
	>();
	for (const section of sectionRows) {
		if (section.visible !== true) {
			continue;
		}
		const pageId = optionalText(section.page_id);
		if (!pageId) {
			diagnostics.push(diagnostic("section_skipped", "warning", "database"));
			continue;
		}
		const current = sectionsByPage.get(pageId) ?? [];
		if (current.length >= portfolioLimits.sectionsPerPage) {
			throw new PortfolioLoadError("dataset_limit_exceeded");
		}
		const parsedSection = sectionSchema.safeParse({
			key: section.section_key,
			type: section.section_type,
			variant: section.variant,
			presentation: section.presentation ?? {},
			content: section.content ?? {},
		});
		if (parsedSection.success) {
			current.push(parsedSection.data);
			sectionsByPage.set(pageId, current);
		} else {
			diagnostics.push(diagnostic("section_skipped", "warning", "database"));
		}
	}

	const pages = pageRows.map((page) =>
		pageSchema.parse({
			slug: page.slug,
			title: page.title,
			...(optionalText(page.description)
				? { description: page.description }
				: {}),
			seo: jsonRecord(page.seo),
			sections: sectionsByPage.get(text(page.id)) ?? [],
		}),
	);

	const technologies = technologyRows.flatMap((row) => {
		const parsed = technologySchema.safeParse({
			id: row.id,
			name: row.name,
			slug: row.slug,
			...(optionalText(row.category) ? { category: row.category } : {}),
		});
		if (!parsed.success) {
			diagnostics.push(
				diagnostic("taxonomy_record_skipped", "warning", "database"),
			);
			return [];
		}
		return [parsed.data];
	});
	const skills = skillRows.flatMap((row) => {
		const parsed = skillSchema.safeParse({
			id: row.id,
			name: row.name,
			slug: row.slug,
			...(optionalText(row.category) ? { category: row.category } : {}),
		});
		if (!parsed.success) {
			diagnostics.push(
				diagnostic("taxonomy_record_skipped", "warning", "database"),
			);
			return [];
		}
		return [parsed.data];
	});
	const technologyIds = new Set(technologies.map(({ id }) => id));
	const skillIds = new Set(skills.map(({ id }) => id));
	const technologyIdsByProject = new Map<string, Set<string>>();
	const skillIdsByProject = new Map<string, Set<string>>();
	for (const relation of projectTechnologyRows) {
		const projectId = optionalText(relation.project_id);
		const technologyId = optionalText(relation.technology_id);
		if (!projectId || !technologyId) {
			diagnostics.push(diagnostic("association_skipped", "info", "database"));
			continue;
		}
		if (!projectIds.includes(projectId) || !technologyIds.has(technologyId)) {
			diagnostics.push(diagnostic("association_skipped", "info", "database"));
			continue;
		}
		const ids = technologyIdsByProject.get(projectId) ?? new Set<string>();
		ids.add(technologyId);
		technologyIdsByProject.set(projectId, ids);
	}
	for (const relation of projectSkillRows) {
		const projectId = optionalText(relation.project_id);
		const skillId = optionalText(relation.skill_id);
		if (!projectId || !skillId) {
			diagnostics.push(diagnostic("association_skipped", "info", "database"));
			continue;
		}
		if (!projectIds.includes(projectId) || !skillIds.has(skillId)) {
			diagnostics.push(diagnostic("association_skipped", "info", "database"));
			continue;
		}
		const ids = skillIdsByProject.get(projectId) ?? new Set<string>();
		ids.add(skillId);
		skillIdsByProject.set(projectId, ids);
	}

	const projects = projectRows.map((project) => {
		const coverImagePath = text(project.cover_image_path);
		const links = [project.repository_url, project.live_url].flatMap((url) => {
			if (typeof url !== "string" || url.length === 0) {
				return [];
			}
			const parsed = linkReferenceSchema.safeParse({ type: "external", url });
			if (!parsed.success) {
				diagnostics.push(
					diagnostic("project_link_skipped", "warning", "database"),
				);
				return [];
			}
			return [parsed.data];
		});
		return projectSchema.parse({
			id: project.id,
			slug: project.slug,
			title: project.title,
			tagline: project.tagline,
			summary: project.summary,
			overview: project.overview,
			coverImage: mediaReferenceSchema.parse({
				source: "storage",
				path: coverImagePath,
			}),
			coverImageAlt: project.cover_image_alt,
			featured: project.featured,
			links,
			technologyIds: [...(technologyIdsByProject.get(text(project.id)) ?? [])],
			skillIds: [...(skillIdsByProject.get(text(project.id)) ?? [])],
		});
	});

	const socialLinks = socialLinkRows.flatMap((row) => {
		const parsed = socialLinkSchema.safeParse({
			id: row.id,
			platform: row.platform,
			label: row.label,
			url: row.url,
			iconIdentifier: row.icon_identifier,
		});
		if (!parsed.success) {
			diagnostics.push(
				diagnostic("social_link_skipped", "warning", "database"),
			);
			return [];
		}
		return [parsed.data];
	});
	const dataset: PortfolioDataset = portfolioDatasetSchema.parse({
		settings: normalizeSettings(settingsRow),
		pages,
		projects,
		technologies,
		skills,
		socialLinks,
	});

	if (
		!uniqueBy(technologies, technologies) ||
		!uniqueBy(skills, skills) ||
		!uniqueBy(projects, projects) ||
		new Set(pages.map(({ slug }) => slug)).size !== pages.length ||
		new Set(socialLinks.map(({ id }) => id)).size !== socialLinks.length
	) {
		throw new PortfolioLoadError("database_invalid");
	}

	return { dataset, source: "database", diagnostics };
}

export async function loadPortfolioWithConfiguration(
	url: string | undefined,
	anonymousKey: string | undefined,
): Promise<PortfolioLoadResult> {
	if (!url && !anonymousKey) {
		return fallbackResult("supabase_not_configured");
	}
	if (!url || !anonymousKey) {
		return fallbackResult("supabase_configuration_incomplete");
	}

	try {
		return await loadPortfolioFromDatabase(url, anonymousKey);
	} catch (error) {
		return fallbackResult(
			error instanceof PortfolioLoadError
				? error.diagnosticCode
				: "database_invalid",
		);
	}
}

export async function loadPortfolio(): Promise<PortfolioLoadResult> {
	return loadPortfolioWithConfiguration(
		env.VITE_SUPABASE_URL,
		env.VITE_SUPABASE_ANON_KEY,
	);
}
