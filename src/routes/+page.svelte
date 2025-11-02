<script lang="ts">
 import BootSequence from "$lib/components/BootSequence.svelte";
 import Desktop from "$lib/components/desktop/Desktop.svelte";
 import { bootState, completeBoot } from "$lib/stores/bootStore.svelte";
 import { userStore } from "$lib/stores/userStore.svelte";
 import type { GETUser } from "./api/user/+server";
 import "../app.css";

 interface Props {
  data: {
   wallpapers: string[];
   user: GETUser;
  };
 }

 let { data }: Props = $props();

 userStore.set(data.user);

 const isBooting = $derived(bootState.isBooting);
 const isReady = $derived(bootState.isReady);
 const isShuttingDown = $derived(bootState.isShuttingDown);

 const wallpaperPath = $derived(data.wallpapers[0] || null);
 const isVideo = $derived.by(() => {
  if (!wallpaperPath) return false;
  const ext = wallpaperPath.toLowerCase();
  return ext.endsWith(".mp4") || ext.endsWith(".webm") || ext.endsWith(".mov");
 });

 function handleBootComplete() {
  completeBoot();
 }
</script>

{#if isBooting || isShuttingDown}
 <BootSequence onBootComplete={handleBootComplete} />
{/if}

{#if isReady && !isShuttingDown}
 <Desktop {wallpaperPath} {isVideo} />
{/if}
