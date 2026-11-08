import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { getPortfolio } from "../lib/portfolio/portfolio";
import { themeStyleVariables } from "../lib/portfolio/theme-style";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	loader: () => getPortfolio(),
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	const { dataset, theme, typography } = Route.useLoaderData();
	return (
		<div
			className="site-frame"
			style={
				{
					...themeStyleVariables(theme),
					...typography.styleVariables,
				} as React.CSSProperties
			}
		>
			{typography.preloadHref ? (
				<link
					rel="preload"
					as="font"
					type="font/woff2"
					href={typography.preloadHref}
					crossOrigin="anonymous"
				/>
			) : null}
			{typography.fontFaceCss ? <style>{typography.fontFaceCss}</style> : null}
			<script
				src="/theme-init.js"
				data-default-mode={dataset.settings.theme.defaultMode}
			/>
			<Header settings={dataset.settings} pages={dataset.pages} />
			<Outlet />
			<Footer settings={dataset.settings} socialLinks={dataset.socialLinks} />
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
