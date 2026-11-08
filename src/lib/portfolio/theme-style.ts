import type { DerivedTheme } from "./theme";
import { type ThemeToken, themeTokenNames } from "./theme-tokens";

export type ThemeStyleVariables = Record<
	`--folio-${"light" | "dark"}-${ThemeToken}`,
	string
>;

export function themeStyleVariables(theme: DerivedTheme): ThemeStyleVariables {
	const result = {} as ThemeStyleVariables;
	for (const mode of ["light", "dark"] as const) {
		for (const token of themeTokenNames) {
			result[`--folio-${mode}-${token}`] = theme[mode][`--${token}`];
		}
	}
	return result;
}
