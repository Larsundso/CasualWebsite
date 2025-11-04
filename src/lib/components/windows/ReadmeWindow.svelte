<svelte:options runes={true} />

<script lang="ts">
 import { readmeStore } from "$lib/stores/readmeStore.svelte";
 import { marked } from "marked";
 import IconBrandGithub from "@tabler/icons-svelte/icons/brand-github";

 const readmeContent = $derived(readmeStore.content);

 const renderer = new marked.Renderer();

 renderer.image = ({ href, title, text }) => {
  let imageSrc = href;
  if (href.startsWith("/")) {
   imageSrc = `https://raw.githubusercontent.com/Larsundso/Larsundso/refs/heads/main${href}`;
  }

  const titleAttr = title ? ` title="${title}"` : "";
  const altAttr = text ? ` alt="${text}"` : ' alt=""';
  return `<img src="${imageSrc}"${altAttr}${titleAttr} style="max-width: 100%;">`;
 };

 marked.setOptions({
  breaks: true,
  gfm: true,
  renderer: renderer
 });

 const htmlContent = $derived.by(() => {
  if (!readmeContent) return "<p>Loading README...</p>";
  try {
   return marked.parse(readmeContent);
  } catch (error) {
   console.error("Error parsing markdown:", error);
   return "<p>Error rendering README</p>";
  }
 });
</script>

<div class="readme-window">
 <div class="readme-header">
  <IconBrandGithub size={20} />
  <span>GitHub README</span>
 </div>

 <div class="readme-content">
  {@html htmlContent}
 </div>
</div>

<style>
 .readme-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e2e;
  color: #cdd6f4;
  overflow: hidden;
 }

 .readme-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #181825;
  border-bottom: 1px solid #313244;
  font-weight: 600;
 }

 .readme-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  line-height: 1.5;
  word-wrap: break-word;
 }

 /* Markdown styling */
 .readme-content :global(h1) {
  font-size: 2em;
  margin-top: 0;
  margin-bottom: 0.5em;
  color: #cba6f7;
  border-bottom: 2px solid #313244;
  padding-bottom: 0.3em;
 }

 .readme-content :global(h2) {
  font-size: 1.5em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #f5c2e7;
  border-bottom: 1px solid #313244;
  padding-bottom: 0.3em;
 }

 .readme-content :global(h3) {
  font-size: 1.25em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #f5e0dc;
 }

 .readme-content :global(h4),
 .readme-content :global(h5),
 .readme-content :global(h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #f5e0dc;
 }

 .readme-content :global(p) {
  margin-top: 0;
  margin-bottom: 16px;
 }

 .readme-content :global(a) {
  color: #89b4fa;
  text-decoration: none;
 }

 .readme-content :global(a:hover) {
  text-decoration: underline;
 }

 .readme-content :global(code) {
  background: #181825;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 0.9em;
 }

 .readme-content :global(pre) {
  background: #181825;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
 }

 .readme-content :global(pre code) {
  background: none;
  padding: 0;
 }

 .readme-content :global(blockquote) {
  border-left: 4px solid #89b4fa;
  padding-left: 1em;
  margin-left: 0;
  color: #a6adc8;
 }

 .readme-content :global(ul),
 .readme-content :global(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
 }

 .readme-content :global(li) {
  margin-bottom: 0.5em;
 }

 .readme-content :global(img) {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  border-radius: 6px;
 }

 .readme-content :global(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
 }

 .readme-content :global(th),
 .readme-content :global(td) {
  border: 1px solid #313244;
  padding: 0.5em;
  text-align: left;
 }

 .readme-content :global(th) {
  background: #181825;
  font-weight: 600;
 }

 .readme-content :global(hr) {
  border: none;
  border-top: 1px solid #313244;
  margin: 2em 0;
 }

 /* Scrollbar styling */
 .readme-content::-webkit-scrollbar {
  width: 8px;
 }

 .readme-content::-webkit-scrollbar-track {
  background: #181825;
 }

 .readme-content::-webkit-scrollbar-thumb {
  background: #313244;
  border-radius: 4px;
 }

 .readme-content::-webkit-scrollbar-thumb:hover {
  background: #45475a;
 }
</style>
