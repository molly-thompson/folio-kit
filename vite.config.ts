import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vitest/config";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		tailwindcss(),
		tanstackStart({ router: { quoteStyle: "double" } }),
		nitro(),
		viteReact(),
	],
	server: {
		// Ensure stable development environment in WSL2
		host: true,
		strictPort: true,
		hmr: {
			protocol: "ws",
			host: "localhost",
			port: 3000,
		},
		open: true,
	},
	test: {
		globals: true,
		environment: "jsdom",
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
	},
	build: {
		rolldownOptions: {
			onLog(level, log, defaultHandler) {
				// Suppress MODULE_LEVEL_DIRECTIVE warnings coming from pnpm store/node_modules
				if (
					log.code === "MODULE_LEVEL_DIRECTIVE" &&
					log.message?.includes("node_modules")
				) {
					return;
				}
				// Pass everything else to Rolldown's default logger
				defaultHandler(level, log);
			},
		},
	},
});

export default config;
