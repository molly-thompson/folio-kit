import { Link } from "@tanstack/react-router";
import type { Page, SiteSettings } from "../lib/portfolio/schema";
import ThemeToggle from "./ThemeToggle";

const alignmentClasses = {
	left: "justify-start",
	center: "justify-center",
	right: "justify-end",
} as const;

export default function Header({
	settings,
	pages,
}: {
	settings: SiteSettings;
	pages: Page[];
}) {
	const showAbout =
		settings.navigation.showAbout &&
		pages.some((page) => page.slug === "about");

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/90 px-4 backdrop-blur-lg">
			<nav
				aria-label="Primary"
				className="page-wrap grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-3 sm:grid-cols-[auto_1fr_auto] sm:py-4"
			>
				<Link
					to="/"
					className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground no-underline sm:px-4 sm:py-2"
				>
					<span
						aria-hidden="true"
						className="size-2 shrink-0 rounded-full bg-primary"
					/>
					<span className="truncate">{settings.siteName}</span>
				</Link>

				<div
					className={`col-span-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold sm:col-span-1 ${alignmentClasses[settings.navigation.alignment]}`}
				>
					<Link
						to="/"
						className="nav-link"
						activeOptions={{ exact: true }}
						activeProps={{ className: "nav-link is-active" }}
					>
						Home
					</Link>
					{showAbout ? (
						<Link
							to="/about"
							className="nav-link"
							activeProps={{ className: "nav-link is-active" }}
						>
							About
						</Link>
					) : null}
				</div>

				<div className="justify-self-end">
					<ThemeToggle defaultMode={settings.theme.defaultMode} />
				</div>
			</nav>
		</header>
	);
}
