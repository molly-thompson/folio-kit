import type { FontReference, MediaReference } from "./schema";

const localAssetPattern = /^(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/;
const storagePrefixes = ["site/", "projects/", "pages/", "fonts/"] as const;

export function assertLocalAssetPath(path: string) {
	if (!localAssetPattern.test(path) || path.startsWith(".")) {
		throw new Error("Invalid local asset path");
	}
	return path;
}

export function assertStorageAssetPath(path: string) {
	if (
		!localAssetPattern.test(path) ||
		!storagePrefixes.some((prefix) => path.startsWith(prefix))
	) {
		throw new Error("Invalid portfolio Storage path");
	}
	return path;
}

export function resolveLocalAsset(reference: MediaReference | FontReference) {
	if (reference.source !== "local") {
		throw new Error("Expected a local asset reference");
	}
	return `/assets/${assertLocalAssetPath(reference.path)}`;
}

export function resolveStorageAsset(
	reference: MediaReference | FontReference,
	publicUrl: (path: string) => string,
) {
	if (reference.source !== "storage") {
		throw new Error("Expected a Storage asset reference");
	}
	return publicUrl(assertStorageAssetPath(reference.path));
}
