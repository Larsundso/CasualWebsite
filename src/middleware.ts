import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
 const response = await next();

 if (import.meta.env.DEV) {
  response.headers.set(
   'Content-Security-Policy',
   "default-src 'self'; img-src 'self' https://cdn.ayakobot.com https://cdn.discordapp.com https://images-ext-1.discordapp.net https://images-ext-2.discordapp.net data: blob:; media-src 'self' https://cdn.ayakobot.com blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://www.youtube.com https://cdn.discordapp.com https://discord.com; frame-src 'self' https://www.youtube.com; worker-src 'self' blob:;"
  );
  response.headers.set('Access-Control-Allow-Origin', '*');
 }

 return response;
});
