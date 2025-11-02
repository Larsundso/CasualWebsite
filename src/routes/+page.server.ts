import { readdir } from "fs/promises";
import { join } from "path";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
 const user = await event.fetch("/api/user").then((res) => res.json());

 try {
  const assetsPath = join(process.cwd(), "static", "assets");
  const files = await readdir(assetsPath);

  const allExtensions = [
   ".gif",
   ".mov",
   ".mp4",
   ".webm",
   ".jpg",
   ".jpeg",
   ".png",
   ".webp",
  ];
  const wallpapers = files
   .filter((file) =>
    allExtensions.some((ext) => file.toLowerCase().endsWith(ext))
   )
   .map((file) => `/assets/${file}`);

  return {
   wallpapers,
   user,
  };
 } catch (error) {
  console.error("Error reading assets directory:", error);

  return {
   wallpapers: [],
   user,
  };
 }
};
