import { type PortfolioDataset, portfolioDatasetSchema } from "./schema";

const fallback = {
	settings: {
		siteName: "Northline Studio",
		tagline: "Interfaces with a sense of place.",
		description:
			"A small digital studio shaping calm, useful products for the public realm.",
		favicon: { source: "local", path: "site/favicon.svg" },
		logo: { source: "local", path: "site/logo.svg" },
		contactEmail: "hello@northline.example",
		contactSubject: "A new project",
		contactMessage:
			"Tell me what you are making, where it should go, and what matters most.",
		theme: {
			defaultMode: "light",
			light: {
				background: "oklch(97% 0.025 155)",
				foreground: "oklch(24% 0.045 190)",
				primary: "oklch(48% 0.12 178)",
				primaryForeground: "oklch(98% 0.01 155)",
			},
			dark: {
				background: "oklch(20% 0.035 190)",
				foreground: "oklch(94% 0.025 155)",
				primary: "oklch(74% 0.12 178)",
				primaryForeground: "oklch(20% 0.035 190)",
			},
		},
		typography: {
			display: "fraunces",
			body: "manrope",
			monospace: "jetbrains-mono",
			scale: "editorial",
			fontFaces: [],
		},
		defaultSeo: {
			title: "Northline Studio",
			description: "Interfaces with a sense of place.",
			canonicalPath: "/",
		},
		navigation: {
			showAbout: true,
			showProjects: true,
			showContact: true,
			alignment: "left",
		},
	},
	pages: [
		{
			slug: "home",
			title: "Northline Studio",
			description: "Interfaces with a sense of place.",
			sections: [
				{
					key: "hero",
					type: "hero",
					variant: "split",
					presentation: { width: "wide", alignment: "left" },
					content: {
						eyebrow: "Independent digital studio",
						title: "Useful things, thoughtfully made.",
						body: "Northline helps people and places become easier to understand, use, and remember.",
						cta: {
							label: "See selected work",
							link: { type: "internal", route: "projects" },
						},
					},
				},
				{
					key: "about",
					type: "about",
					variant: "default",
					presentation: { width: "default", alignment: "left" },
					content: {
						title: "A quieter kind of clarity",
						body: "I work across strategy, interface design, and front-end craft to turn complex services into welcoming experiences.",
					},
				},
				{
					key: "featured",
					type: "projects",
					variant: "featured",
					presentation: { width: "wide", alignment: "left" },
					content: {
						title: "Selected work",
						projectSlugs: ["tide-table", "civic-room"],
					},
				},
			],
		},
		{ slug: "about", title: "About", sections: [] },
		{ slug: "projects", title: "Projects", sections: [] },
		{ slug: "contact", title: "Contact", sections: [] },
	],
	projects: [
		{
			id: "11111111-1111-4111-8111-111111111111",
			slug: "tide-table",
			title: "Tide Table",
			tagline: "A clearer way to read the coast.",
			summary: "A public information service for coastal communities.",
			overview:
				"Tide Table turns dense marine data into a calm, legible planning tool.",
			coverImage: { source: "local", path: "projects/tide-table/cover.svg" },
			coverImageAlt: "Layered blue lines representing a tide chart",
			featured: true,
			links: [{ type: "external", url: "https://example.com/tide-table" }],
			technologyIds: ["22222222-2222-4222-8222-222222222222"],
			skillIds: ["33333333-3333-4333-8333-333333333333"],
		},
		{
			id: "44444444-4444-4444-8444-444444444444",
			slug: "civic-room",
			title: "Civic Room",
			tagline: "A better front door for local decisions.",
			summary:
				"A service pattern for making council information easier to find.",
			overview:
				"Civic Room brings together research, plain language, and a flexible publishing system.",
			coverImage: { source: "local", path: "projects/civic-room/cover.svg" },
			coverImageAlt: "Warm orange blocks arranged like a civic floor plan",
			featured: true,
			links: [{ type: "external", url: "https://example.com/civic-room" }],
			technologyIds: ["55555555-5555-4555-8555-555555555555"],
			skillIds: ["66666666-6666-4666-8666-666666666666"],
		},
	],
	technologies: [
		{
			id: "22222222-2222-4222-8222-222222222222",
			name: "TypeScript",
			slug: "typescript",
			category: "Build",
		},
		{
			id: "55555555-5555-4555-8555-555555555555",
			name: "React",
			slug: "react",
			category: "Build",
		},
	],
	skills: [
		{
			id: "33333333-3333-4333-8333-333333333333",
			name: "Information design",
			slug: "information-design",
			category: "Practice",
		},
		{
			id: "66666666-6666-4666-8666-666666666666",
			name: "Service design",
			slug: "service-design",
			category: "Practice",
		},
	],
	socialLinks: [
		{
			id: "77777777-7777-4777-8777-777777777777",
			platform: "GitHub",
			label: "GitHub",
			url: "https://github.com/example",
			iconIdentifier: "github",
		},
	],
} satisfies PortfolioDataset;

export const fallbackPortfolio: PortfolioDataset =
	portfolioDatasetSchema.parse(fallback);
