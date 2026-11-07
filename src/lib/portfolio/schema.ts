import { z } from "zod";

export const staticRoutes = ["home", "about", "projects", "contact"] as const;
export const staticRouteSchema = z.enum(staticRoutes);
export type StaticRoute = z.infer<typeof staticRouteSchema>;

export const mediaReferenceSchema = z.discriminatedUnion("source", [
	z.object({ source: z.literal("local"), path: z.string().min(1) }),
	z.object({ source: z.literal("storage"), path: z.string().min(1) }),
]);
export type MediaReference = z.infer<typeof mediaReferenceSchema>;

export const fontReferenceSchema = mediaReferenceSchema;
export type FontReference = z.infer<typeof fontReferenceSchema>;

export const linkReferenceSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("internal"), route: staticRouteSchema }),
	z.object({
		type: z.literal("project"),
		slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	}),
	z.object({
		type: z.literal("external"),
		url: z.url().refine((value) => new URL(value).protocol === "https:"),
	}),
	z.object({
		type: z.literal("anchor"),
		target: z.string().regex(/^[A-Za-z][A-Za-z0-9_:-]*$/),
	}),
]);
export type LinkReference = z.infer<typeof linkReferenceSchema>;

export const seoSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	canonicalPath: z.string().startsWith("/").optional(),
	image: mediaReferenceSchema.optional(),
});
export type SeoConfig = z.infer<typeof seoSchema>;

export const sectionPresentationSchema = z.object({
	width: z.enum(["default", "wide", "narrow"]).optional(),
	alignment: z.enum(["left", "center"]).optional(),
	surface: z.enum(["default", "muted"]).optional(),
});
export type SectionPresentation = z.infer<typeof sectionPresentationSchema>;

export const sectionSchema = z.object({
	key: z.string().min(1),
	type: z.string().min(1),
	variant: z.string().min(1),
	presentation: sectionPresentationSchema.default({}),
	content: z.record(z.string(), z.unknown()).default({}),
});
export type Section = z.infer<typeof sectionSchema>;

export const pageSchema = z.object({
	slug: staticRouteSchema,
	title: z.string().min(1),
	description: z.string().min(1).optional(),
	seo: seoSchema.optional(),
	sections: z.array(sectionSchema),
});
export type Page = z.infer<typeof pageSchema>;

export const technologySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	slug: z.string().min(1),
	category: z.string().min(1).optional(),
});
export type Technology = z.infer<typeof technologySchema>;

export const skillSchema = technologySchema;
export type Skill = z.infer<typeof skillSchema>;

export const projectSchema = z.object({
	id: z.string().uuid(),
	slug: z.string().min(1),
	title: z.string().min(1),
	tagline: z.string().min(1),
	summary: z.string().min(1),
	overview: z.string().min(1),
	coverImage: mediaReferenceSchema,
	coverImageAlt: z.string().min(1),
	featured: z.boolean(),
	links: z.array(linkReferenceSchema),
	technologyIds: z.array(z.string().uuid()),
	skillIds: z.array(z.string().uuid()),
});
export type Project = z.infer<typeof projectSchema>;

export const socialLinkSchema = z.object({
	id: z.string().uuid(),
	platform: z.string().min(1),
	label: z.string().min(1),
	url: z.url().refine((value) => new URL(value).protocol === "https:"),
	iconIdentifier: z.string().min(1),
});
export type SocialLink = z.infer<typeof socialLinkSchema>;

export const themeModeConfigSchema = z.object({
	background: z.string().min(1),
	foreground: z.string().min(1),
	primary: z.string().min(1),
	primaryForeground: z.string().min(1),
	secondary: z.string().optional(),
	secondaryForeground: z.string().optional(),
	accent: z.string().optional(),
	accentForeground: z.string().optional(),
});

export const themeConfigSchema = z.object({
	light: themeModeConfigSchema.optional(),
	dark: themeModeConfigSchema.optional(),
	overrides: z.record(z.string(), z.record(z.string(), z.string())).optional(),
	defaultMode: z.enum(["light", "dark", "system"]).default("system"),
});

export const typographyConfigSchema = z.object({
	display: z.string().min(1),
	body: z.string().min(1),
	monospace: z.string().min(1).optional(),
	scale: z.enum(["compact", "default", "editorial"]).default("default"),
});

export const siteSettingsSchema = z.object({
	siteName: z.string().min(1),
	tagline: z.string().min(1),
	description: z.string().min(1),
	favicon: mediaReferenceSchema.optional(),
	logo: mediaReferenceSchema.optional(),
	contactEmail: z.email(),
	contactSubject: z.string().min(1),
	contactMessage: z.string().min(1),
	theme: themeConfigSchema,
	typography: typographyConfigSchema,
	defaultSeo: seoSchema,
	navigation: z.object({
		showAbout: z.boolean().default(true),
		showProjects: z.boolean().default(true),
		showContact: z.boolean().default(true),
		alignment: z.enum(["left", "center", "right"]).default("left"),
	}),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const portfolioDatasetSchema = z.object({
	settings: siteSettingsSchema,
	pages: z.array(pageSchema),
	projects: z.array(projectSchema),
	technologies: z.array(technologySchema),
	skills: z.array(skillSchema),
	socialLinks: z.array(socialLinkSchema),
});
export type PortfolioDataset = z.infer<typeof portfolioDatasetSchema>;

export const dataDiagnosticSchema = z.object({
	code: z.string().min(1),
	severity: z.enum(["info", "warning", "error"]),
	source: z.enum(["database", "fallback"]),
});
export type DataDiagnostic = z.infer<typeof dataDiagnosticSchema>;

export const portfolioLoadResultSchema = z.object({
	dataset: portfolioDatasetSchema,
	source: z.enum(["database", "fallback"]),
	diagnostics: z.array(dataDiagnosticSchema),
});
export type PortfolioLoadResult = z.infer<typeof portfolioLoadResultSchema>;
