export const PremiumType = {
 0: "None",
 1: "Nitro Classic",
 2: "Nitro",
 3: "Nitro Basic",
} as const;

export interface Guild {
 id: string;
 name: string;
 icon: string | null; // https://cdn.discordapp.com/icons/<id>/<icon>.<icon starts with a_ ? .gif : .webp>?size=4096
 banner: string | null; // https://cdn.discordapp.com/banners/<id>/<banner>.<banner starts with a_ ? .gif : .webp>?size=4096
 owner: boolean;
 permissions: string;
 features: string[];
 approximate_member_count: number;
 approximate_presence_count: number;
}

export interface User {
 user: User;
 username: string;
 id: string;
 global_name: string;
 avatar: string | null; // https://cdn.discordapp.com/avatars/<id>/<avatar>.<avatar starts with a_ ? .gif : .webp>?size=4096
 display_name_styles: null;
 clan: Clan | null;
 premium_guild_since: string; // ISO timestamp since starting to boost
 premium_since: string; // ISO timestamp since starting Nitro
 premium_type: keyof typeof PremiumType;
 user_profile: {
  bio: string;
  accent_color: number | null;
  pronouns: string;
  banner: string | null; // https://cdn.discordapp.com/banners/<user ID>/<banner>.<starts with a_ ? .gif : .webp>?size=4096
  theme_colors: [number, number];
 };
 badges: Badge[];
 widgets: {
  updated_at: string; // ISO timestamp
  data: { type: GameDataType; games: Game[] };
 }[];
 mutual_guilds: { id: string; nick: string | null }[];
}

interface Clan {
 identity_guild_id: string;
 tag: string;
 badge: string; // https://cdn.discordapp.com/clan-badges/<identity_guild_id>/<badge>.png?size=4096
}

enum BadgeIDs {
 premium_tenure_60_month_v2 = "premium_tenure_60_month_v2",
 hypesquad_house_2 = "hypesquad_house_2",
 active_developer = "active_developer",
 guild_booster_lvl9 = "guild_booster_lvl9",
 legacy_username = "legacy_username",
 quest_completed = "quest_completed",
}

interface Badge {
 id: BadgeIDs;
 description: string;
 icon: string; // https://cdn.discordapp.com/badge-icons/<icon>.png
}

export enum GameDataType {
 played_games = "Games I like",
 want_to_play_games = "Want to Play Games",
 current_games = "Current Games",
 favorite_games = "Favorite Games",
}

export enum GameTags {
 casual = "Casual",
 intermediate = "Intermediate",
 expert = "Expert",
 better_than_you = "Better than you",

 obsessed = "Obsessed",
 love_it = "Love it",
 kind_of_love_it = "Kind of love it",
 kind_of_hate_it = "Kind of hate it",
 rage_quitting = "Rage quitting",

 looking_for_group = "Looking for group",
 open_to_play = "Open to play",
 looking_for_tips = "Looking for tips",
 open_to_teach = "Open to teach",
 looking_to_discuss = "Looking to discuss",
}

interface Game {
 game_id: string;
 comment: string | null;
 tags: GameTags[];
}

interface GenericConnection {
 name: string;
 type: string; // name of the integration, like youtube, twitch, xbox, etc ("domain" makes name property the url)
 integrations: [];
 access_token: string;
}

interface SteamConnection extends GenericConnection {
 metadata: {
  game_count: string;
  created_at: string;
 };
}

export interface Connection extends GenericConnection, SteamConnection {}

export interface SupplementalGame {
 application_id: string;
 name: string;
 summary: string;
 cover_image_url: string;
 artwork_urls: string[];
 screenshot_urls: string[];
 themes: (keyof typeof Themes)[];
 platforms: (keyof typeof Platforms)[];
 genres: (keyof typeof Genres)[];
 first_release_date: string; // ISO date
 websites: { url: string; category: keyof typeof WebsiteCategories }[];
 publisher_names: string[];
 developer_name: string[];
 steam_id: string;
}

export const Genres = {
 5: "Platformer",
 8: "Adventure",
 20: "Role-Playing",
 23: "Shooter",
 28: "Simulation",
 48: "Strategy",
 57: "Puzzle",
 67: "Indie",
} as const;

export const Platforms = {
 0: "Desktop",
 1: "XBox",
 2: "PlayStation",
 3: "",
 4: "",
 5: "Nintendo Switch",
} as const;

export const Themes = {} as const;

export const WebsiteCategories = {
 1: "Official",
 2: "Game Wiki",
 3: "Wikipedia",
 4: "Facebook",
 5: "Twitter",
 6: "Twitch",
 7: "Unknown",
 8: "Instagram",
 9: "YouTube",
 10: "App Store",
 11: "App Store",
 12: "Google Play",
 13: "Steam",
 14: "Reddit",
 15: "Itch.io",
 16: "Epic Games",
 17: "GOG",
 18: "Discord",
};
