import { TOKEN } from 'astro:env/server';
import type {
 Application,
 Connection,
 ExtendedGuild,
 Guild,
 SupplementalGame,
 User,
} from "$lib/types/discord";

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
 console.log('Fetching user data with TOKEN:', TOKEN ? 'TOKEN exists' : 'TOKEN is undefined');

 if (!TOKEN || TOKEN === '') {
  throw new Error("No TOKEN provided");
 }

 const user = await fetch(
  `https://discord.com/api/v9/users/${Buffer.from(
   TOKEN.split(".")[0],
   "base64"
  ).toString()}/profile?type=account_popout&with_mutual_guilds=false&with_mutual_friends=false&with_mutual_friends_count=false`,
  {
   headers: {
    authorization: TOKEN,
    "x-super-properties": btoa(
     JSON.stringify({ client_build_number: 464164 })
    ),
   },
  }
 ).then((r) => r.json() as Promise<User>);

 const connections = await fetch(
  `https://discord.com/api/v9/users/@me/connections`,
  {
   headers: { authorization: TOKEN },
  }
 )
  .then((r) => r.json() as Promise<Connection[]>)
  .then((conns) => conns.map((c) => ({ ...c, access_token: "" })));

 const gameIds = user.widgets
  .map((w) => w.data.games.map((g) => g.game_id))
  .flat();

 const supplementalGames = await fetch(
  `https://discord.com/api/v9/applications/games-supplemental?${gameIds
   .map((id) => `&application_ids=${id}`)
   .join("")}`,
  { headers: { authorization: TOKEN } }
 ).then((r) => r.json());

 const guilds = await fetch(
  "https://discord.com/api/v9/users/@me/guilds?with_counts=true",
  {
   headers: { authorization: TOKEN },
  }
 )
  .then((r) => r.json() as Promise<Guild[]>)
  .then((g) =>
   g
    .filter(
     (guild) =>
      guild.approximate_member_count >= 100 &&
      (guild.owner || BigInt(guild.permissions) & 32n) === 32n
    )
    .sort((a, b) => b.approximate_member_count - a.approximate_member_count)
  );

 const guildDetails = await Promise.all(
  guilds.map((g) =>
   fetch(`https://discord.com/api/v9/guilds/${g.id}`, {
    headers: { authorization: TOKEN },
   }).then((r) => r.json() as Promise<ExtendedGuild>)
  )
 );

 const apps = await fetch(
  "https://discord.com/api/v9/applications?with_team_applications=true",
  { headers: { authorization: TOKEN } }
 )
  .then((r) => r.json() as Promise<Application[]>)
  .then((apps) =>
   apps
    .filter((a) => a.bot_public)
    .sort((a, b) => b.approximate_guild_count - a.approximate_guild_count)
  );

 return { user, connections, games: supplementalGames, guilds, apps, guildDetails };
}

