<svelte:options runes={true} />

<script lang="ts">
 import BootSequence from "./BootSequence.svelte";
 import Desktop from "./desktop/Desktop.svelte";
 import { bootState, completeBoot } from "$lib/stores/bootStore.svelte";
 import { userStore } from "$lib/stores/userStore.svelte";
 import type { GETUser } from "$lib/api/fetchUserData";

 interface Props {
  data: { user: GETUser };
 }

 let { data }: Props = $props();

 userStore.set(data.user);

 const isBooting = $derived(bootState.isBooting);
 const isReady = $derived(bootState.isReady);
 const isShuttingDown = $derived(bootState.isShuttingDown);

 const wallpaperPath = "https://cdn.ayakobot.com/neko-sleeping.gif";
 const isVideo = false;

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
