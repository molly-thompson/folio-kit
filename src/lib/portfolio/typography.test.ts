import { describe, expect, it } from "vitest";
import { typographyConfigSchema } from "./schema";
import { resolveTypography } from "./typography";

describe("typography resolution", () => {
	it("resolves bundled family identifiers and scale presets", () => {
		const typography = typographyConfigSchema.parse({
			display: "fraunces",
			body: "manrope",
			monospace: "jetbrains-mono",
			scale: "editorial",
		});
		const resolved = resolveTypography(typography, () => {
			throw new Error("No Storage fonts expected");
		});

		expect(resolved.styleVariables["--font-display"]).toContain(
			"Fraunces Variable",
		);
		expect(resolved.styleVariables["--font-body"]).toContain(
			"Manrope Variable",
		);
		expect(resolved.styleVariables["--font-monospace"]).toContain(
			"JetBrains Mono Variable",
		);
		expect(resolved.styleVariables["--type-line-height"]).toBe("1.78");
		expect(resolved.fontFaceCss).toBe("");
	});

	it("generates safe font-face CSS and preloads only the display face", () => {
		const typography = typographyConfigSchema.parse({
			display: "Studio Serif",
			body: "manrope",
			fontFaces: [
				{
					family: "Studio Serif",
					reference: { source: "storage", path: "fonts/studio-serif.woff2" },
					weight: [300, 700],
					style: "normal",
				},
			],
		});
		const resolved = resolveTypography(
			typography,
			(path) =>
				`https://portfolio.supabase.co/storage/v1/object/public/${path}`,
		);

		expect(resolved.fontFaceCss).toContain('font-family: "Studio Serif"');
		expect(resolved.fontFaceCss).toContain("font-weight: 300 700");
		expect(resolved.fontFaceCss).toContain("font-display: swap");
		expect(resolved.preloadHref).toContain("fonts/studio-serif.woff2");
	});

	it("rejects unsafe font names and paths", () => {
		expect(() =>
			typographyConfigSchema.parse({
				display: "fraunces",
				body: "manrope",
				fontFaces: [
					{
						family: 'Bad"; color: red; "',
						reference: { source: "local", path: "fonts/../font.woff2" },
					},
				],
			}),
		).toThrow();
	});

	it("uses role-specific system fallbacks for unavailable identifiers", () => {
		const typography = typographyConfigSchema.parse({
			display: "missing-display",
			body: "missing-body",
		});
		const resolved = resolveTypography(typography, () => "", "fallback");

		expect(resolved.styleVariables["--font-display"]).toBe("Georgia, serif");
		expect(resolved.styleVariables["--font-body"]).toContain("system-ui");
		expect(resolved.diagnostics).toEqual([
			{
				code: "display_font_unavailable",
				severity: "warning",
				source: "fallback",
			},
			{
				code: "body_font_unavailable",
				severity: "warning",
				source: "fallback",
			},
		]);
	});
});
