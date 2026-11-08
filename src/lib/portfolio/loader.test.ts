import { describe, expect, it, vi } from "vitest";
import {
	loadPortfolioFromDatabase,
	loadPortfolioWithConfiguration,
	portfolioLimits,
} from "./loader";

const settings = {
	site_name: "Database portfolio",
	tagline: "Thoughtfully built",
	description: "A public portfolio.",
	favicon_path: null,
	logo_path: null,
	contact_email: "hello@example.com",
	contact_subject: "A project",
	contact_message: "Tell me about it.",
	theme: { defaultMode: "light" },
	typography: { display: "fraunces", body: "manrope" },
	navigation: {},
	default_seo: {},
};

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

describe("portfolio loader", () => {
	it("returns the complete fallback when Supabase is not configured", async () => {
		const result = await loadPortfolioWithConfiguration(undefined, undefined);

		expect(result.source).toBe("fallback");
		expect(result.diagnostics[0]?.code).toBe("supabase_not_configured");
		expect(result.dataset.pages.some(({ slug }) => slug === "home")).toBe(true);
	});

	it("normalizes the public rows into the shared dataset contract", async () => {
		const fetcher = vi.fn(async (input: RequestInfo | URL) => {
			const table = new URL(input.toString()).pathname.split("/").at(-1);
			const data =
				table === "site_settings"
					? [settings]
					: table === "pages"
						? [
								{
									id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
									slug: "home",
									title: "Database portfolio",
									description: null,
									seo: {},
								},
							]
						: [];
			return jsonResponse(data);
		});

		const result = await loadPortfolioFromDatabase(
			"https://portfolio.supabase.co",
			"public-anonymous-key",
			fetcher,
		);

		expect(result.source).toBe("database");
		expect(result.dataset.settings.siteName).toBe("Database portfolio");
		expect(result.dataset.pages).toEqual([
			{
				slug: "home",
				title: "Database portfolio",
				seo: {},
				sections: [],
			},
		]);
		expect(fetcher).toHaveBeenCalled();
	});

	it("rejects a published dataset that exceeds a collection limit", async () => {
		const fetcher = vi.fn(async (input: RequestInfo | URL) => {
			const table = new URL(input.toString()).pathname.split("/").at(-1);
			const data =
				table === "site_settings"
					? [settings]
					: table === "pages"
						? Array.from({ length: portfolioLimits.pages + 1 }, (_, index) => ({
								id: `aaaaaaaa-aaaa-4aaa-8aaa-${String(index).padStart(12, "0")}`,
								slug: "home",
								title: "Database portfolio",
								seo: {},
							}))
						: [];
			return jsonResponse(data);
		});

		await expect(
			loadPortfolioFromDatabase(
				"https://portfolio.supabase.co",
				"public-anonymous-key",
				fetcher,
			),
		).rejects.toThrow();
	});

	it("skips malformed optional sections and project associations", async () => {
		const pageId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
		const projectId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
		const fetcher = vi.fn(async (input: RequestInfo | URL) => {
			const table = new URL(input.toString()).pathname.split("/").at(-1);
			const data =
				table === "site_settings"
					? [settings]
					: table === "pages"
						? [
								{
									id: pageId,
									slug: "home",
									title: "Database portfolio",
									seo: {},
								},
							]
						: table === "projects"
							? [
									{
										id: projectId,
										slug: "sample",
										title: "Sample",
										tagline: "A sample project",
										summary: "Summary",
										overview: "Overview",
										cover_image_path: "projects/sample.webp",
										cover_image_alt: "Sample project",
										repository_url: null,
										live_url: null,
										featured: true,
									},
								]
							: table === "page_sections"
								? [
										{
											page_id: [],
											section_key: "invalid-page",
											section_type: "hero",
											variant: "split",
											visible: true,
										},
										{
											page_id: pageId,
											section_key: "invalid-content",
											section_type: "hero",
											variant: "split",
											presentation: [],
											content: [],
											visible: true,
										},
									]
								: table === "project_technologies"
									? [{ project_id: [], technology_id: [] }]
									: [];
			return jsonResponse(data);
		});

		const result = await loadPortfolioFromDatabase(
			"https://portfolio.supabase.co",
			"public-anonymous-key",
			fetcher,
		);

		expect(result.source).toBe("database");
		expect(result.dataset.pages[0]?.sections).toEqual([]);
		expect(result.dataset.projects[0]?.technologyIds).toEqual([]);
		expect(
			result.diagnostics.filter(({ code }) => code === "section_skipped"),
		).toHaveLength(2);
		expect(
			result.diagnostics.filter(({ code }) => code === "association_skipped"),
		).toHaveLength(1);
	});

	it("falls back when database theme colors are invalid", async () => {
		const invalidSettings = {
			...settings,
			theme: {
				defaultMode: "light",
				light: {
					background: "not-a-color",
					foreground: "oklch(0.24 0.045 190)",
					primary: "oklch(0.48 0.12 178)",
					primaryForeground: "oklch(0.98 0.01 155)",
				},
			},
		};
		const invalidFetcher = vi.fn(async (input: RequestInfo | URL) => {
			const table = new URL(input.toString()).pathname.split("/").at(-1);
			return jsonResponse(
				table === "site_settings"
					? [invalidSettings]
					: table === "pages"
						? [
								{
									id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
									slug: "home",
									title: "Database portfolio",
									seo: {},
								},
							]
						: [],
			);
		});
		const result = await loadPortfolioWithConfiguration(
			"https://portfolio.supabase.co",
			"public-anonymous-key",
			invalidFetcher,
		);

		expect(result.source).toBe("fallback");
		expect(result.diagnostics[0]?.code).toBe("database_invalid");
	});
});
