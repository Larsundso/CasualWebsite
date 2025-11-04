<svelte:options runes={true} />

<script lang="ts">
 import { onMount } from "svelte";
 import { fade } from "svelte/transition";
 import { initSystemStats } from "$lib/stores/systemStore.svelte";
 import { windowState, openWindow } from "$lib/stores/windowStore.svelte";
 import { bootState } from "$lib/stores/bootStore.svelte";
 import {
  initYouTubePlayer,
  cleanupMusicStore,
  musicState,
 } from "$lib/stores/musicStore.svelte";

 import Sidebar from "./Sidebar.svelte";
 import WindowManager from "./WindowManager.svelte";

 interface Props {
  wallpaperPath: string | null;
  isVideo: boolean;
 }

 let { wallpaperPath, isVideo }: Props = $props();

 const currentWorkspace = $derived(windowState.currentWorkspace);
 const isReady = $derived(bootState.isReady);

 onMount(() => {
  const cleanup = initSystemStats();

  if (isReady) {
   setTimeout(() => {
    openWindow("music", "Music Player", "music");

    if (!musicState.isMobile) {
     setTimeout(() => initYouTubePlayer(), 100);
    }
   }, 500);
  }

  return () => {
   cleanup();
   cleanupMusicStore();
  };
 });
</script>

{#if isReady}
 <div class="desktop" transition:fade={{ duration: 300 }}>
  <!-- Wallpaper -->
  {#if wallpaperPath}
   <div class="wallpaper-container">
    {#if isVideo}
     <video
      src={wallpaperPath}
      autoplay
      loop
      muted
      playsinline
      class="wallpaper-video"
     ></video>
    {:else}
     <img
      src={wallpaperPath}
      alt="Desktop Wallpaper"
      class="wallpaper-image"
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
     />
    {/if}
   </div>
  {/if}

  <!-- Sidebar -->
  <Sidebar />

  <!-- Window Manager -->
  <WindowManager />

  {#if !musicState.isMobile}
   <div class="persistent-youtube-container">
    <div id={musicState.youtubePlayerId} class="youtube-player-frame"></div>
   </div>
  {/if}
 </div>
{/if}

<style>
 .desktop {
  position: fixed;
  inset: 0;
  background: #1e1e2e;
  overflow: hidden;
 }

 .wallpaper-container {
  position: absolute;
  inset: 0;
  z-index: 0;
 }

 .wallpaper-video,
 .wallpaper-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
 }

 .persistent-youtube-container {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 640px;
  height: 360px;
  z-index: -1;
  pointer-events: none;
 }

 .youtube-player-frame {
  width: 100%;
  height: 100%;
 }
</style>
