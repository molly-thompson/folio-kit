import { resolveLocalAsset, resolveStorageAsset } from "./assets";
import type { DataDiagnostic, FontFace, TypographyConfig } from "./schema";

const knownFamilies: Record<string, string> = {
	fraunces: '"Fraunces Variable", "Fraunces", Georgia, serif',
	manrope:
		'"Manrope Variable", "Manrope", ui-sans-serif, system-ui, sans-serif',
	"jetbrains-mono":
		'"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace',
	"system-serif": "Georgia, serif",
	"system-sans": "ui-sans-serif, system-ui, sans-serif",
	"system-mono": "ui-monospace, SFMono-Regular, monospace",
};

const fallbacks = {
	display: "Georgia, serif",
	body: "ui-sans-serif, system-ui, sans-serif",
	monospace: "ui-monospace, SFMono-Regular, monospace",
} as const;

const scales = {
	compact: {
		display: "clamp(2rem, 5vw, 4rem)",
		body: "0.95rem",
		lineHeight: "1.6",
	},
	default: {
		display: "clamp(2.25rem, 5vw, 4.5rem)",
		body: "1rem",
		lineHeight: "1.7",
	},
	editorial: {
		display: "clamp(2.75rem, 6vw, 5.5rem)",
		body: "1.05rem",
		lineHeight: "1.78",
	},
} as const;

export type TypographyStyleVariables = Record<
	| "--font-display"
	| "--font-body"
	| "--font-monospace"
	| "--type-display-size"
	| "--type-body-size"
	| "--type-line-height",
	string
>;

export type ResolvedTypography = {
	styleVariables: TypographyStyleVariables;
	fontFaceCss: string;
	preloadHref?: string;
	diagnostics: DataDiagnostic[];
};

function roleFamily(
	family: string | undefined,
	role: keyof typeof fallbacks,
	fontFaces: FontFace[],
): { stack: string; available: boolean } {
	if (!family) {
		return { stack: fallbacks[role], available: true };
	}
	const known = knownFamilies[family];
	if (known) {
		return { stack: known, available: true };
	}
	if (fontFaces.some((fontFace) => fontFace.family === family)) {
		return { stack: `"${family}", ${fallbacks[role]}`, available: true };
	}
	return { stack: fallbacks[role], available: false };
}

function fontUrl(
	fontFace: FontFace,
	storagePublicUrl: (path: string) => string,
): string {
	if (fontFace.reference.source === "local") {
		return resolveLocalAsset(fontFace.reference);
	}
	return resolveStorageAsset(fontFace.reference, storagePublicUrl);
}

function faceCss(fontFace: FontFace, url: string): string {
	const weight = Array.isArray(fontFace.weight)
		? `${fontFace.weight[0]} ${fontFace.weight[1]}`
		: `${fontFace.weight}`;
	return [
		"@font-face {",
		`  font-family: "${fontFace.family}";`,
		`  src: url("${url}") format("${fontFace.format}");`,
		`  font-style: ${fontFace.style};`,
		`  font-weight: ${weight};`,
		"  font-display: swap;",
		"}",
	].join("\n");
}

export function resolveTypography(
	config: TypographyConfig,
	storagePublicUrl: (path: string) => string,
	source: DataDiagnostic["source"] = "database",
): ResolvedTypography {
	const display = roleFamily(config.display, "display", config.fontFaces);
	const body = roleFamily(config.body, "body", config.fontFaces);
	const monospace = roleFamily(config.monospace, "monospace", config.fontFaces);
	const diagnostics = [
		...(!display.available
			? [fontDiagnostic("display_font_unavailable", source)]
			: []),
		...(!body.available
			? [fontDiagnostic("body_font_unavailable", source)]
			: []),
		...(!monospace.available
			? [fontDiagnostic("monospace_font_unavailable", source)]
			: []),
	];
	const scalesForConfig = scales[config.scale];
	const cssByFont = config.fontFaces.map((fontFace) =>
		faceCss(fontFace, fontUrl(fontFace, storagePublicUrl)),
	);
	const displayFace = config.fontFaces.find(
		(fontFace) =>
			fontFace.family === config.display && fontFace.style === "normal",
	);

	return {
		styleVariables: {
			"--font-display": display.stack,
			"--font-body": body.stack,
			"--font-monospace": monospace.stack,
			"--type-display-size": scalesForConfig.display,
			"--type-body-size": scalesForConfig.body,
			"--type-line-height": scalesForConfig.lineHeight,
		},
		fontFaceCss: cssByFont.join("\n"),
		...(displayFace
			? { preloadHref: fontUrl(displayFace, storagePublicUrl) }
			: {}),
		diagnostics,
	};
}

function fontDiagnostic(
	code: string,
	source: DataDiagnostic["source"],
): DataDiagnostic {
	return { code, severity: "warning", source };
}
