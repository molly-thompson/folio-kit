import { describe, expect, it } from "vitest";
import { deriveTheme } from "./theme";

const baseTheme = {
	defaultMode: "light" as const,
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
};

describe("theme derivation", () => {
	it("creates complete light and dark semantic token sets", () => {
		const theme = deriveTheme(baseTheme);

		expect(theme.light["--background"]).toBe(baseTheme.light.background);
		expect(theme.dark["--primary"]).toBe(baseTheme.dark.primary);
		expect(theme.light["--sidebar-foreground"]).toBeTruthy();
		expect(theme.dark["--chart-5"]).toBeTruthy();
	});

	it("derives a semantically distinct missing mode from the configured mode", () => {
		const theme = deriveTheme({
			light: baseTheme.light,
			defaultMode: "system",
		});

		expect(theme.dark["--background"]).not.toBe(theme.light["--background"]);
		expect(theme.dark["--foreground"]).not.toBe(theme.light["--foreground"]);
	});

	it("preserves token overrides and rejects unreadable overrides", () => {
		const theme = deriveTheme({
			...baseTheme,
			overrides: {
				light: { primary: "#236f76" },
			},
		});

		expect(theme.light["--primary"]).toBe("#236f76");
		expect(() =>
			deriveTheme({
				...baseTheme,
				overrides: {
					light: { "primary-foreground": "#236f76" },
				},
			}),
		).toThrow("Theme contrast failed");
	});

	it("rejects malformed color values instead of generating invalid CSS", () => {
		expect(() =>
			deriveTheme({
				...baseTheme,
				light: { ...baseTheme.light, background: "url(javascript:alert(1))" },
			}),
		).toThrow("Invalid theme color");
	});
});
