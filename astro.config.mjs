import { defineConfig, envField } from "astro/config";
import svelte from "@astrojs/svelte";
import { fileURLToPath } from "url";
import { vitePreprocess } from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
 integrations: [
  svelte({
   preprocess: vitePreprocess(),
   extensions: [".svelte"],
  }),
 ],
 output: "static",
 build: {
  inlineStylesheets: "auto",
 },
 env: {
  schema: {
   TOKEN: envField.string({
    context: "server",
    access: "secret",
   }),
  },
 },
 vite: {
  resolve: {
   alias: {
    $lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
   },
  },
  optimizeDeps: {
   exclude: ["@tabler/icons-svelte"],
  },
 },
});
