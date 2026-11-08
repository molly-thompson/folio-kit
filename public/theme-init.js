(() => {
	const script = document.currentScript;
	const allowedModes = ["light", "dark", "system"];
	const defaultMode = allowedModes.includes(script?.dataset.defaultMode ?? "")
		? script.dataset.defaultMode
		: "system";
	let preference = null;

	try {
		const stored = localStorage.getItem("folio-theme-mode");
		const legacy = localStorage.getItem("theme");
		const value = stored ?? legacy;
		preference = value === "auto" ? "system" : value;
	} catch {
		preference = null;
	}

	const mode = allowedModes.includes(preference) ? preference : defaultMode;
	const resolved =
		mode === "system"
			? matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: mode;

	document.documentElement.classList.toggle("dark", resolved === "dark");
	document.documentElement.dataset.themePreference = mode;
	document.documentElement.dataset.themeResolved = resolved;
	document.documentElement.style.colorScheme = resolved;
})();
