import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { TOKEN } from "$env/static/private";
import type {
 Connection,
 Guild,
 SupplementalGame,
 User,
} from "$lib/types/discord";

export type GETUser = {
 user: User;
 connections: Connection[];
 games: { supplemental_game_data: SupplementalGame[] };
 guilds: Guild[];
};

let cached: GETUser | null = null;
let lastRequest = 0;

export const GET: RequestHandler = async (req) => {
 if (req.url.searchParams.get("refresh")) lastRequest = 0;
 console.log("Last request:", lastRequest);

 if (lastRequest > Date.now() - 5 * 60000) return json(cached);
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
  .fetch("https://discord.com/api/v9//users/@me/guilds?with_counts=true", {
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
    .sort((a, b) => a.name.localeCompare(b.name))
  );

 cached = { user, connections, games: supplementalGames, guilds };

 return json(cached);
};
