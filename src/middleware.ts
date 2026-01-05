import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
 const response = await next();

 if (import.meta.env.DEV) {
  response.headers.set(
   'Content-Security-Policy',
   "default-src 'self'; img-src 'self' https://cdn.ayakobot.com https://cdn.discordapp.com https://discordapp.com https://images-ext-1.discordapp.net https://images-ext-2.discordapp.net http://*.shields.io https://*.shields.io https://wakatime.com https://komarev.com https://top.gg https://media.giphy.com https://codestats-readme.avior.me https://raw.githubusercontent.com https://github-readme-stats.vercel.app https://images.igdb.com data: blob:; media-src 'self' https://cdn.ayakobot.com blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://www.youtube.com https://cdn.discordapp.com https://discord.com; frame-src 'self' https://www.youtube.com; worker-src 'self' blob:;"
  );
  response.headers.set('Access-Control-Allow-Origin', '*');
 }

 return response;
});
