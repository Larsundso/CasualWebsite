/**
 * IGDB API Integration
 * Fetches rich game data from Internet Game Database
 */

import { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } from "astro:env/server";

// Cache for access token
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get IGDB access token via Twitch OAuth2
 */
async function getAccessToken(): Promise<string> {
	// Return cached token if still valid (with 5 min buffer)
	if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
		return cachedToken.token;
	}

	const response = await fetch(
		`https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
		{ method: "POST" }
	);

	if (!response.ok) {
		throw new Error(`Failed to get IGDB access token: ${response.status}`);
	}

	const data = (await response.json()) as {
		access_token: string;
		expires_in: number;
	};

	cachedToken = {
		token: data.access_token,
		expiresAt: Date.now() + data.expires_in * 1000
	};

	return cachedToken.token;
}

/**
 * Make authenticated request to IGDB API
 */
async function igdbRequest<T>(endpoint: string, body: string): Promise<T> {
	const token = await getAccessToken();

	const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
		method: "POST",
		headers: {
			"Client-ID": IGDB_CLIENT_ID,
			Authorization: `Bearer ${token}`,
			Accept: "application/json"
		},
		body
	});

	if (!response.ok) {
		throw new Error(`IGDB API error: ${response.status}`);
	}

	return response.json() as Promise<T>;
}

// IGDB Types
export interface IGDBImage {
	id: number;
	image_id: string;
	url: string;
	width: number;
	height: number;
}

export interface IGDBGenre {
	id: number;
	name: string;
	slug: string;
}

export interface IGDBPlatform {
	id: number;
	name: string;
	abbreviation?: string;
	slug: string;
}

export interface IGDBCompany {
	id: number;
	company: {
		id: number;
		name: string;
		slug: string;
	};
	developer: boolean;
	publisher: boolean;
}

export interface IGDBWebsite {
	id: number;
	category: number;
	url: string;
}

export interface IGDBVideo {
	id: number;
	video_id: string; // YouTube video ID
	name: string;
}

export interface IGDBTheme {
	id: number;
	name: string;
	slug: string;
}

export interface IGDBGameMode {
	id: number;
	name: string;
	slug: string;
}

export interface IGDBGame {
	id: number;
	name: string;
	slug: string;
	summary?: string;
	storyline?: string;
	first_release_date?: number; // Unix timestamp
	rating?: number; // 0-100
	aggregated_rating?: number; // 0-100
	total_rating?: number; // 0-100
	rating_count?: number;
	cover?: IGDBImage;
	artworks?: IGDBImage[];
	screenshots?: IGDBImage[];
	genres?: IGDBGenre[];
	platforms?: IGDBPlatform[];
	themes?: IGDBTheme[];
	game_modes?: IGDBGameMode[];
	involved_companies?: IGDBCompany[];
	websites?: IGDBWebsite[];
	videos?: IGDBVideo[];
	similar_games?: number[];
	url?: string;
}

// Website category enum matching IGDB
export const IGDBWebsiteCategory = {
	1: "Official",
	2: "Wikia",
	3: "Wikipedia",
	4: "Facebook",
	5: "Twitter",
	6: "Twitch",
	8: "Instagram",
	9: "YouTube",
	10: "iPhone",
	11: "iPad",
	12: "Android",
	13: "Steam",
	14: "Reddit",
	15: "Itch.io",
	16: "Epic Games",
	17: "GOG",
	18: "Discord"
} as const;

/**
 * Build IGDB image URL with specified size
 * Sizes: t_thumb, t_cover_small, t_cover_big, t_screenshot_med, t_screenshot_big, t_screenshot_huge, t_720p, t_1080p
 */
export function getIGDBImageUrl(
	imageId: string,
	size:
		| "t_thumb"
		| "t_cover_small"
		| "t_cover_big"
		| "t_screenshot_med"
		| "t_screenshot_big"
		| "t_screenshot_huge"
		| "t_720p"
		| "t_1080p" = "t_cover_big"
): string {
	return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

/**
 * Search for a game by name and return detailed info
 */
export async function searchGame(gameName: string): Promise<IGDBGame | null> {
	const query = `
		search "${gameName.replace(/"/g, '\\"')}";
		fields name,slug,summary,storyline,first_release_date,rating,aggregated_rating,total_rating,rating_count,url,
			cover.image_id,cover.width,cover.height,
			artworks.image_id,artworks.width,artworks.height,
			screenshots.image_id,screenshots.width,screenshots.height,
			genres.name,genres.slug,
			platforms.name,platforms.abbreviation,platforms.slug,
			themes.name,themes.slug,
			game_modes.name,game_modes.slug,
			involved_companies.company.name,involved_companies.company.slug,involved_companies.developer,involved_companies.publisher,
			websites.category,websites.url,
			videos.video_id,videos.name,
			similar_games;
		where version_parent = null;
		limit 1;
	`;

	try {
		const results = await igdbRequest<IGDBGame[]>("games", query);
		return results.length > 0 ? results[0] : null;
	} catch (error) {
		console.error(`Failed to fetch IGDB data for "${gameName}":`, error);
		return null;
	}
}

/**
 * Fetch multiple games by name in batch
 */
export async function searchGames(
	gameNames: string[]
): Promise<Map<string, IGDBGame>> {
	const results = new Map<string, IGDBGame>();

	// Process in batches to avoid rate limiting
	const batchSize = 5;
	for (let i = 0; i < gameNames.length; i += batchSize) {
		const batch = gameNames.slice(i, i + batchSize);
		const promises = batch.map(async (name) => {
			const game = await searchGame(name);
			if (game) {
				results.set(name.toLowerCase(), game);
			}
		});
		await Promise.all(promises);

		// Small delay between batches to be nice to the API
		if (i + batchSize < gameNames.length) {
			await new Promise((resolve) => setTimeout(resolve, 250));
		}
	}

	return results;
}

/**
 * Get developers from involved companies
 */
export function getDevelopers(game: IGDBGame): string[] {
	return (
		game.involved_companies
			?.filter((ic) => ic.developer)
			.map((ic) => ic.company.name) ?? []
	);
}

/**
 * Get publishers from involved companies
 */
export function getPublishers(game: IGDBGame): string[] {
	return (
		game.involved_companies
			?.filter((ic) => ic.publisher)
			.map((ic) => ic.company.name) ?? []
	);
}

/**
 * Get Steam URL from websites
 */
export function getSteamUrl(game: IGDBGame): string | null {
	const steamWebsite = game.websites?.find((w) => w.category === 13);
	return steamWebsite?.url ?? null;
}

/**
 * Get website by category
 */
export function getWebsiteByCategory(
	game: IGDBGame,
	category: keyof typeof IGDBWebsiteCategory
): string | null {
	const website = game.websites?.find((w) => w.category === category);
	return website?.url ?? null;
}
