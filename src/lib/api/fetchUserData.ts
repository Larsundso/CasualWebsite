import type {
 Application,
 Connection,
 DiscordGameApp,
 ExtendedGuild,
 Guild,
 SupplementalGame,
 User
} from "$lib/types/discord";
import { TOKEN } from "astro:env/server";
import fs from "fs/promises";
import userData from "../data/userData.json" with { type: "json" };
import { searchGames, type IGDBGame } from "./igdb.js";

export type GETUser = {
 user: User;
 connections: Connection[];
 games: SupplementalGame[];
 guilds: Guild[];
 apps: Application[];
 guildDetails: ExtendedGuild[];
};

/**
 * Fetches user data from Discord API at build time
 * This will be called during the Astro build process to generate static data
 * Falls back to mock data if TOKEN is not provided
 */
export async function fetchUserData(): Promise<GETUser> {
 return userData as unknown as GETUser;

 // console.log(
 //  "Fetching user data with TOKEN:",
 //  TOKEN ? "TOKEN exists" : "TOKEN is undefined"
 // );

 // if (!TOKEN || TOKEN === "+") {
 //  return {
 //   connections: [],
 //   games: [],
 //   guilds: [],
 //   apps: [],
 //   guildDetails: [],
 //   user: {
 //    avatar: null,
 //    badges: [],
 //    clan: null,
 //    display_name_styles: null,
 //    global_name: "Lolo",
 //    id: "1",
 //    mutual_guilds: [],
 //    premium_guild_since: new Date().toISOString(),
 //    username: "Lolo",
 //    widgets: [],
 //    premium_since: new Date().toISOString(),
 //    premium_type: 2,
 //    user: null as never,
 //    user_profile: {
 //     accent_color: null,
 //     banner: null,
 //     bio: "test",
 //     pronouns: "pro/nouns",
 //     theme_colors: [1, 2]
 //    }
 //   }
 //  };
 // }

 // const user = await fetch(
 //  `https://discord.com/api/v9/users/${Buffer.from(
 //   TOKEN.split(".")[0],
 //   "base64"
 //  ).toString()}/profile?type=account_popout&with_mutual_guilds=false&with_mutual_friends=false&with_mutual_friends_count=false`,
 //  {
 //   headers: {
 //    authorization: TOKEN,
 //    "x-super-properties": btoa(JSON.stringify({ client_build_number: 464164 }))
 //   }
 //  }
 // ).then((r) => r.json() as Promise<User>);

 // const connections = await fetch(
 //  `https://discord.com/api/v9/users/@me/connections`,
 //  {
 //   headers: { authorization: TOKEN }
 //  }
 // )
 //  .then((r) => r.json() as Promise<Connection[]>)
 //  .then((conns) => conns.map((c) => ({ ...c, access_token: "" })));

 // const gameIds = user.widgets
 //  .map((w) => w.data.games.map((g) => g.game_id))
 //  .flat();

 // const discordGames = await fetch(
 //  `https://discord.com/api/v9/applications/public?${gameIds
 //   .map((id) => `&application_ids=${id}`)
 //   .join("")}`,
 //  { headers: { authorization: TOKEN } }
 // ).then((r) => r.json() as Promise<DiscordGameApp[]>);

 // console.log("Fetched Discord games:", discordGames.length);

 // // Fetch IGDB data for all games
 // const gameNames = discordGames.map((g) => g.name);
 // console.log("Fetching IGDB data for:", gameNames);

 // const igdbData = await searchGames(gameNames);
 // console.log("Fetched IGDB data for", igdbData.size, "games");

 // // Merge Discord game data with IGDB data
 // const supplementalGames: SupplementalGame[] = discordGames.map((game) => {
 //  const igdbGame = igdbData.get(game.name.toLowerCase());
 //  return {
 //   ...game,
 //   igdb: igdbGame
 //    ? {
 //      id: igdbGame.id,
 //      name: igdbGame.name,
 //      slug: igdbGame.slug,
 //      summary: igdbGame.summary,
 //      storyline: igdbGame.storyline,
 //      first_release_date: igdbGame.first_release_date,
 //      rating: igdbGame.rating,
 //      aggregated_rating: igdbGame.aggregated_rating,
 //      total_rating: igdbGame.total_rating,
 //      rating_count: igdbGame.rating_count,
 //      cover: igdbGame.cover,
 //      artworks: igdbGame.artworks,
 //      screenshots: igdbGame.screenshots,
 //      genres: igdbGame.genres,
 //      platforms: igdbGame.platforms,
 //      themes: igdbGame.themes,
 //      game_modes: igdbGame.game_modes,
 //      involved_companies: igdbGame.involved_companies,
 //      websites: igdbGame.websites,
 //      videos: igdbGame.videos,
 //      url: igdbGame.url
 //     }
 //    : undefined
 //  };
 // });

 // console.log(
 //  "Games with IGDB data:",
 //  supplementalGames.filter((g) => g.igdb).length
 // );

 // const guilds = await fetch(
 //  "https://discord.com/api/v9/users/@me/guilds?with_counts=true",
 //  {
 //   headers: { authorization: TOKEN }
 //  }
 // )
 //  .then((r) => r.json() as Promise<Guild[]>)
 //  .then((g) =>
 //   g
 //    .filter(
 //     (guild) =>
 //      guild.approximate_member_count >= 100 &&
 //      (guild.owner || BigInt(guild.permissions) & 32n) === 32n
 //    )
 //    .sort((a, b) => b.approximate_member_count - a.approximate_member_count)
 //  );

 // const guildDetails = await Promise.all(
 //  guilds.map((g) =>
 //   fetch(`https://discord.com/api/v9/guilds/${g.id}`, {
 //    headers: { authorization: TOKEN }
 //   }).then((r) => r.json() as Promise<ExtendedGuild>)
 //  )
 // );

 // const apps = await fetch(
 //  "https://discord.com/api/v9/applications?with_team_applications=true",
 //  { headers: { authorization: TOKEN } }
 // )
 //  .then((r) => r.json() as Promise<Application[]>)
 //  .then((apps) =>
 //   apps
 //    .filter((a) => a.bot_public)
 //    .sort((a, b) => b.approximate_guild_count - a.approximate_guild_count)
 //  );

 // const returnData = {
 //  user,
 //  connections,
 //  games: supplementalGames,
 //  guilds,
 //  apps,
 //  guildDetails
 // };

 // fs.writeFile("./src/lib/data/userData.json", JSON.stringify(returnData, null, 2));

 // return returnData;
}
