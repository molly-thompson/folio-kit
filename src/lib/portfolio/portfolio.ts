import { createServerFn } from "@tanstack/react-start";

export const getPortfolio = createServerFn({ method: "GET" }).handler(
	async () => {
		const { loadPortfolio } = await import("./loader");
		return loadPortfolio();
	},
);
