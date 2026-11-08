import type { SiteSettings, SocialLink } from "../lib/portfolio/schema";

export default function Footer({
	settings,
	socialLinks,
}: {
	settings: SiteSettings;
	socialLinks: SocialLink[];
}) {
	return (
		<footer className="site-footer mt-20 px-4 py-8">
			<div className="page-wrap flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-col gap-2">
					<p className="m-0 text-sm font-semibold text-foreground">
						&copy; {settings.siteName}
					</p>
					<p className="m-0 max-w-prose text-sm text-muted-foreground">
						{settings.tagline}
					</p>
					<a className="w-fit text-sm" href={`mailto:${settings.contactEmail}`}>
						{settings.contactEmail}
					</a>
				</div>

				{socialLinks.length > 0 ? (
					<nav
						aria-label="Social links"
						className="flex flex-wrap gap-x-5 gap-y-2"
					>
						{socialLinks.map((socialLink) => (
							<a
								key={socialLink.id}
								href={socialLink.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-muted-foreground"
							>
								{socialLink.label}
							</a>
						))}
					</nav>
				) : null}
			</div>
		</footer>
	);
}
