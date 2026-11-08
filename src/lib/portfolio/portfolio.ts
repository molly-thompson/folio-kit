import { createServerFn } from "@tanstack/react-start";

export const getPortfolio = createServerFn({ method: "GET" }).handler(
	async () => {
		const [{ loadPortfolio }, { deriveTheme }] = await Promise.all([
			import("./loader"),
			import("./theme"),
		]);
		const result = await loadPortfolio();
		return { ...result, theme: deriveTheme(result.dataset.settings.theme) };
	},
);
