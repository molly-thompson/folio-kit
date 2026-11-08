import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const preferenceKey = "folio-theme-mode";

function getInitialMode(defaultMode: ThemeMode): ThemeMode {
	try {
		const stored = window.localStorage.getItem(preferenceKey);
		if (stored === "light" || stored === "dark" || stored === "system") {
			return stored;
		}
		if (stored === "auto") {
			return "system";
		}
		const legacyStored = window.localStorage.getItem("theme");
		if (
			legacyStored === "light" ||
			legacyStored === "dark" ||
			legacyStored === "auto"
		) {
			return legacyStored === "auto" ? "system" : legacyStored;
		}
	} catch {
		return defaultMode;
	}
	return defaultMode;
}

function applyThemeMode(mode: ThemeMode) {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

	document.documentElement.classList.toggle("dark", resolved === "dark");
	document.documentElement.dataset.themePreference = mode;
	document.documentElement.dataset.themeResolved = resolved;
	document.documentElement.style.colorScheme = resolved;
}

export default function ThemeToggle({
	defaultMode,
}: {
	defaultMode: ThemeMode;
}) {
	const [mode, setMode] = useState<ThemeMode | null>(null);

	useEffect(() => {
		const initialMode = getInitialMode(defaultMode);
		setMode(initialMode);
		applyThemeMode(initialMode);
	}, [defaultMode]);

	useEffect(() => {
		if (mode !== "system") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyThemeMode("system");

		media.addEventListener("change", onChange);
		return () => {
			media.removeEventListener("change", onChange);
		};
	}, [mode]);

	function toggleMode() {
		const nextMode: ThemeMode =
			mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
		setMode(nextMode);
		applyThemeMode(nextMode);
		try {
			window.localStorage.setItem(preferenceKey, nextMode);
		} catch {
			return;
		}
	}

	const label = mode
		? `Theme mode: ${mode}. Click to switch mode.`
		: "Change color theme";

	return (
		<button
			type="button"
			onClick={toggleMode}
			aria-label={label}
			title={label}
			className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-accent"
		>
			{mode === null ? "Theme" : mode === "system" ? "System" : mode}
		</button>
	);
}
