import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { TOKEN } from "$env/static/private";
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

let cachedUser: GETUser | null = null;
let cachedGuildDetails: ExtendedGuild[] = []
let lastRequest = 0;
let lastGuildDetailsRequest = 0;

export const GET: RequestHandler = async (req) => {
 if (req.url.searchParams.get("refresh")) lastRequest = 0;
 console.log("Last request:", lastRequest);

 if (lastRequest > Date.now() - 60 * 60000) return json(cachedUser);
 lastRequest = Date.now();

 const user = await req
  .fetch(
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
  )
  .then((r) => r.json() as Promise<User>);

 const connections = await req
  .fetch(`https://discord.com/api/v9/users/@me/connections`, {
   headers: { authorization: TOKEN },
  })
  .then((r) => r.json() as Promise<Connection[]>)
  .then((conns) => conns.map((c) => ({ ...c, access_token: "" })));

 const gameIds = user.widgets
  .map((w) => w.data.games.map((g) => g.game_id))
  .flat();

 const supplementalGames = await req
  .fetch(
   `https://discord.com/api/v9/applications/games-supplemental?${gameIds
    .map((id) => `&application_ids=${id}`)
    .join("")}`,
   { headers: { authorization: TOKEN } }
  )
  .then((r) => r.json());

 const guilds = await req
  .fetch("https://discord.com/api/v9/users/@me/guilds?with_counts=true", {
   headers: { authorization: TOKEN },
  })
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

 const guildDetails = lastGuildDetailsRequest > Date.now() - 24 * 60 * 60000 ?
  cachedGuildDetails :
  await Promise.all(guilds.map((g) => req
   .fetch(`https://discord.com/api/v9/guilds/${g.id}`, {
    headers: { authorization: TOKEN },
   })
   .then((r) => r.json() as Promise<ExtendedGuild>)
   .then((d) => {
    cachedGuildDetails.push(d);
    return d;
   })
  ));
 lastGuildDetailsRequest = Date.now();

 const apps = await req
  .fetch("https://discord.com/api/v9/applications?with_team_applications=true",
   { headers: { authorization: TOKEN } }
  )
  .then((r) => r.json() as Promise<Application[]>)
  .then((apps) =>
   apps
    .filter((a) => a.bot_public)
    .sort((a, b) => b.approximate_guild_count - a.approximate_guild_count)
  );

 cachedUser = { user, connections, games: supplementalGames, guilds, apps, guildDetails };

 return json(cachedUser);
};
