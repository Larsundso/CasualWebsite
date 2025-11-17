import type {
 Application,
 Connection,
 ExtendedGuild,
 Guild,
 SupplementalGame,
 User
} from "$lib/types/discord";
// import { TOKEN } from "astro:env/server";
// import fs from "fs/promises";
import userData from "../data/userData.json" with { type: 'json' };

export type GETUser = {
 user: User;
 connections: Connection[];
 games: { supplemental_game_data: SupplementalGame[] };
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
 //   games: { supplemental_game_data: [] },
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

 // const supplementalGames = await fetch(
 //  `https://discord.com/api/v9/applications/games-supplemental?${gameIds
 //   .map((id) => `&application_ids=${id}`)
 //   .join("")}`,
 //  { headers: { authorization: TOKEN } }
 // ).then((r) => r.json());

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

 // fs.writeFile("./userData.json", JSON.stringify(returnData, null, 2));

 // return returnData;
}
