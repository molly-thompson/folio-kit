import { createServerFn } from "@tanstack/react-start";

export const getPortfolio = createServerFn({ method: "GET" }).handler(
	async () => {
		const [{ loadPortfolio }, { deriveTheme }] = await Promise.all([
			import("./loader"),
			import("./theme"),
		]);
		const result = await loadPortfolio();
		const [{ resolveTypography }, { env }] = await Promise.all([
			import("./typography"),
			import("../../env"),
		]);
		const typography = resolveTypography(
			result.dataset.settings.typography,
			(path) => {
				if (!env.VITE_SUPABASE_URL) {
					throw new Error("Storage fonts require a configured Supabase URL");
				}
				const baseUrl = env.VITE_SUPABASE_URL.replace(/\/+$/, "");
				const encodedPath = path.split("/").map(encodeURIComponent).join("/");
				return `${baseUrl}/storage/v1/object/public/portfolio-media/${encodedPath}`;
			},
			result.source,
		);
		return {
			...result,
			theme: deriveTheme(result.dataset.settings.theme),
			typography,
			diagnostics: [...result.diagnostics, ...typography.diagnostics],
		};
	},
);
