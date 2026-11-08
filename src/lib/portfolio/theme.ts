import { converter, formatCss, type Oklch, parse, wcagContrast } from "culori";
import type { ThemeConfig, ThemeToken } from "./schema";

const convertToOklch = converter("oklch");
const contrastThreshold = 4.5;
const fallbackModes = {
	light: {
		background: "oklch(0.97 0.025 155)",
		foreground: "oklch(0.24 0.045 190)",
		primary: "oklch(0.48 0.12 178)",
		primaryForeground: "oklch(0.98 0.01 155)",
	},
	dark: {
		background: "oklch(0.18 0.035 190)",
		foreground: "oklch(0.94 0.025 155)",
		primary: "oklch(0.74 0.12 178)",
		primaryForeground: "oklch(0.18 0.035 190)",
	},
} as const;

export type ThemeCssVariables = Record<`--${ThemeToken}`, string>;
export type DerivedTheme = {
	light: ThemeCssVariables;
	dark: ThemeCssVariables;
	defaultMode: ThemeConfig["defaultMode"];
};

function color(value: string, token: string): Oklch {
	const parsed = parse(value);
	const converted = parsed ? convertToOklch(parsed) : undefined;
	if (!converted || converted.l === undefined) {
		throw new Error(`Invalid theme color for ${token}`);
	}
	return {
		mode: "oklch",
		l: converted.l,
		c: converted.c ?? 0,
		...(converted.h === undefined ? {} : { h: converted.h }),
	};
}

function atLightness(
	value: string,
	lightness: number,
	chroma?: number,
): string {
	const source = color(value, "generated");
	const generated: Oklch = {
		mode: "oklch",
		l: lightness,
		c: Math.min(chroma ?? source.c, 0.14),
		...(source.h === undefined ? {} : { h: source.h }),
	};
	return formatCss(generated);
}

function contrast(foreground: string, background: string, token: string) {
	if (wcagContrast(foreground, background) < contrastThreshold) {
		throw new Error(`Theme contrast failed for ${token}`);
	}
}

function modeInput(
	config: ThemeConfig,
	mode: "light" | "dark",
): NonNullable<ThemeConfig["light"]> {
	const provided = config[mode];
	if (provided) {
		return provided;
	}
	const inverseMode = mode === "light" ? "dark" : "light";
	const source = config[inverseMode];
	const fallback = fallbackModes[mode];
	if (!source) {
		return fallback;
	}

	const backgroundSource = color(source.background, "background");
	const foregroundSource = color(source.foreground, "foreground");
	const primarySource = color(source.primary, "primary");
	const dark = mode === "dark";
	const generatedPrimary = atLightness(
		source.primary,
		dark ? 0.74 : 0.46,
		Math.max(primarySource.c, 0.08),
	);
	const primaryForeground =
		wcagContrast("white", generatedPrimary) >=
		wcagContrast("black", generatedPrimary)
			? "white"
			: "black";

	return {
		background: atLightness(
			source.background,
			dark ? 0.18 : 0.97,
			Math.min(backgroundSource.c, 0.04),
		),
		foreground: atLightness(
			source.foreground,
			dark ? 0.94 : 0.23,
			Math.min(foregroundSource.c, 0.05),
		),
		primary: generatedPrimary,
		primaryForeground,
	};
}

function deriveMode(
	config: ThemeConfig,
	mode: "light" | "dark",
): ThemeCssVariables {
	const input = modeInput(config, mode);
	const dark = mode === "dark";
	const background = input.background;
	const foreground = input.foreground;
	const primary = input.primary;
	const primaryForeground = input.primaryForeground;
	const card = atLightness(background, dark ? 0.21 : 0.99, 0.02);
	const cardForeground = foreground;
	const popover = card;
	const popoverForeground = foreground;
	const secondary =
		input.secondary ?? atLightness(background, dark ? 0.29 : 0.92, 0.025);
	const secondaryForeground = input.secondaryForeground ?? foreground;
	const muted = atLightness(background, dark ? 0.25 : 0.93, 0.025);
	const mutedForeground = atLightness(foreground, dark ? 0.68 : 0.47, 0.035);
	const accent = input.accent ?? secondary;
	const accentForeground = input.accentForeground ?? foreground;
	const destructive = dark ? "oklch(0.65 0.19 25)" : "oklch(0.54 0.2 25)";
	const destructiveForeground = dark ? "oklch(0.16 0.02 25)" : "white";
	const border = atLightness(background, dark ? 0.34 : 0.86, 0.025);
	const inputColor = border;
	const ring = primary;
	const surface = card;
	const surfaceMuted = muted;
	const shadowColor = formatCss({
		...color(foreground, "foreground"),
		alpha: dark ? 0.32 : 0.14,
	});

	const generated: Record<ThemeToken, string> = {
		background,
		foreground,
		card,
		"card-foreground": cardForeground,
		popover,
		"popover-foreground": popoverForeground,
		primary,
		"primary-foreground": primaryForeground,
		secondary,
		"secondary-foreground": secondaryForeground,
		muted,
		"muted-foreground": mutedForeground,
		accent,
		"accent-foreground": accentForeground,
		destructive,
		"destructive-foreground": destructiveForeground,
		border,
		input: inputColor,
		ring,
		surface,
		"surface-muted": surfaceMuted,
		interaction: primary,
		"shadow-color": shadowColor,
		sidebar: card,
		"sidebar-foreground": foreground,
		"sidebar-primary": primary,
		"sidebar-primary-foreground": primaryForeground,
		"sidebar-accent": accent,
		"sidebar-accent-foreground": accentForeground,
		"sidebar-border": border,
		"sidebar-ring": ring,
		"chart-1": primary,
		"chart-2": atLightness(primary, dark ? 0.68 : 0.53, 0.14),
		"chart-3": "oklch(0.62 0.13 82)",
		"chart-4": "oklch(0.58 0.14 320)",
		"chart-5": "oklch(0.58 0.14 35)",
	};
	const overrides = config.overrides?.[mode];
	if (overrides) {
		for (const [token, value] of Object.entries(overrides)) {
			if (value !== undefined) {
				color(value, token);
				generated[token as ThemeToken] = value;
			}
		}
	}

	contrast(generated.foreground, generated.background, "foreground");
	contrast(
		generated["primary-foreground"],
		generated.primary,
		"primary-foreground",
	);
	contrast(generated["card-foreground"], generated.card, "card-foreground");
	contrast(
		generated["popover-foreground"],
		generated.popover,
		"popover-foreground",
	);
	contrast(
		generated["secondary-foreground"],
		generated.secondary,
		"secondary-foreground",
	);
	contrast(generated["muted-foreground"], generated.muted, "muted-foreground");
	contrast(
		generated["accent-foreground"],
		generated.accent,
		"accent-foreground",
	);
	contrast(
		generated["destructive-foreground"],
		generated.destructive,
		"destructive-foreground",
	);
	contrast(
		generated["sidebar-foreground"],
		generated.sidebar,
		"sidebar-foreground",
	);
	contrast(
		generated["sidebar-primary-foreground"],
		generated["sidebar-primary"],
		"sidebar-primary-foreground",
	);
	contrast(
		generated["sidebar-accent-foreground"],
		generated["sidebar-accent"],
		"sidebar-accent-foreground",
	);

	return Object.fromEntries(
		Object.entries(generated).map(([token, value]) => [`--${token}`, value]),
	) as ThemeCssVariables;
}

export function deriveTheme(config: ThemeConfig): DerivedTheme {
	return {
		light: deriveMode(config, "light"),
		dark: deriveMode(config, "dark"),
		defaultMode: config.defaultMode,
	};
}
