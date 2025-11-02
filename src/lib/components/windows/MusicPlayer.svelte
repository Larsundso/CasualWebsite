<script lang="ts">
 import IconCloudRain from "@tabler/icons-svelte/icons/cloud-rain";
 import IconAirConditioning from "@tabler/icons-svelte/icons/air-conditioning";
 import IconCoffee from "@tabler/icons-svelte/icons/coffee";
 import IconCar from "@tabler/icons-svelte/icons/car";
 import IconRadio from "@tabler/icons-svelte/icons/radio";
 import IconVolume from "@tabler/icons-svelte/icons/volume";
 import IconDroplet from "@tabler/icons-svelte/icons/droplet";
 import IconCloudStorm from "@tabler/icons-svelte/icons/cloud-storm";
 import IconHexagon3d from "@tabler/icons-svelte/icons/hexagon-3d";
 import IconFlame from "@tabler/icons-svelte/icons/flame";
 import IconTree from "@tabler/icons-svelte/icons/tree";
 import IconFeather from "@tabler/icons-svelte/icons/feather";
 import IconBeach from "@tabler/icons-svelte/icons/beach";
 import IconVolume2 from "@tabler/icons-svelte/icons/volume-2";
 import IconPlayerPlay from "@tabler/icons-svelte/icons/player-play";
 import IconPlayerPause from "@tabler/icons-svelte/icons/player-pause";
 import IconPlayerStop from "@tabler/icons-svelte/icons/player-stop";
 import IconBrandYoutube from "@tabler/icons-svelte/icons/brand-youtube";
 import IconChevronDown from "@tabler/icons-svelte/icons/chevron-down";
 import IconChevronUp from "@tabler/icons-svelte/icons/chevron-up";
 import IconPlayerSkipForward from "@tabler/icons-svelte/icons/player-skip-forward";
 import IconPlayerSkipBack from "@tabler/icons-svelte/icons/player-skip-back";
 import type { ComponentType } from "svelte";
 import {
  musicState,
  setYoutubeUrl,
  toggleSound,
  setSoundVolume,
  toggleYoutube,
  setYoutubeVolume,
  isYoutubePlaying,
  nextYoutubeVideo,
  previousYoutubeVideo,
  soundPresets,
  applyPreset,
  stopAllSounds,
  getSoundColor,
 } from "$lib/stores/musicStore.svelte";
 import AudioVisualizer from "$lib/components/AudioVisualizer.svelte";

 const soundIconMap: Record<string, ComponentType> = {
  "cloud-rain": IconCloudRain,
  "air-conditioning": IconAirConditioning,
  coffee: IconCoffee,
  car: IconCar,
  radio: IconRadio,
  volume: IconVolume,
  droplet: IconDroplet,
  "cloud-storm": IconCloudStorm,
  "hexagon-3d": IconHexagon3d,
  flame: IconFlame,
  tree: IconTree,
  feather: IconFeather,
  beach: IconBeach,
 };

 function getSoundIcon(iconName: string): ComponentType {
  return soundIconMap[iconName] || IconVolume;
 }

 let showYoutubeInput = $state(false);
 let tempYoutubeUrl = $state(musicState.youtubeUrl);
 let youtubeExpanded = $state(false);

 function updateYoutubeUrl() {
  showYoutubeInput = false;
  setYoutubeUrl(tempYoutubeUrl);
 }

 function handleEditUrl() {
  tempYoutubeUrl = musicState.youtubeUrl;
  showYoutubeInput = true;
 }

 const youtubePlaying = $derived(isYoutubePlaying());

 const playingAnalysers = $derived(
  musicState.playingSoundsWithAnalysers.map((item) => ({
   analyser: item.analyser!,
   color: item.color,
   name: item.sound.name,
  }))
 );
</script>

<div class="music-player">
 <!-- Global Visualizer -->
 <div class="global-visualizer-section">
  <h3 class="section-title">
   <IconVolume2
    size={20}
    stroke={1.5}
    style="display: inline-block; vertical-align: middle; margin-right: 8px;"
   />
   Master Audio Visualizer
  </h3>
  <div class="master-visualizer-wrapper">
   <AudioVisualizer
    analysers={playingAnalysers}
    width={600}
    height={80}
    barCount={128}
    mode="multiline"
   />
  </div>
 </div>

 <!-- Presets Section -->
 <div class="presets-section">
  <div class="presets-header">
   <h3 class="section-title">Sound Presets</h3>
   <button class="stop-all-btn" onclick={stopAllSounds} title="Stop All Sounds">
    <IconPlayerStop size={16} stroke={1.5} />
    Stop All
   </button>
  </div>
  <div class="presets-grid">
   {#each soundPresets as preset}
    <button class="preset-btn" onclick={() => applyPreset(preset)}>
     <span class="preset-icon">{preset.icon}</span>
     <div class="preset-info">
      <span class="preset-name">{preset.name}</span>
      <span class="preset-desc">{preset.description}</span>
     </div>
    </button>
   {/each}
  </div>
 </div>

 <!-- YouTube Music Section -->
 <div class="music-section youtube-section">
  <div class="sound-control youtube-control">
   <div class="sound-header">
    <button
     class="expand-toggle"
     onclick={() => (youtubeExpanded = !youtubeExpanded)}
    >
     {#if youtubeExpanded}
      <IconChevronUp size={16} stroke={1.5} />
     {:else}
      <IconChevronDown size={16} stroke={1.5} />
     {/if}
    </button>
    <span class="sound-icon youtube-icon">
     <IconBrandYoutube size={20} stroke={1.5} />
    </span>
    <span class="sound-name">YouTube Music</span>
    <div class="youtube-controls">
     <button
      class="youtube-skip-btn"
      onclick={previousYoutubeVideo}
      disabled={!musicState.isPlayerReady}
      title="Previous video"
     >
      <IconPlayerSkipBack size={16} stroke={1.5} />
     </button>
     <button
      class="sound-toggle"
      class:playing={youtubePlaying}
      onclick={toggleYoutube}
      disabled={!musicState.isPlayerReady}
     >
      {#if youtubePlaying}
       <IconPlayerPause size={16} stroke={1.5} />
      {:else}
       <IconPlayerPlay size={16} stroke={1.5} />
      {/if}
     </button>
     <button
      class="youtube-skip-btn"
      onclick={nextYoutubeVideo}
      disabled={!musicState.isPlayerReady}
      title="Next video"
     >
      <IconPlayerSkipForward size={16} stroke={1.5} />
     </button>
    </div>
   </div>

   <!-- Visualizer (placeholder for YouTube - no actual analyser) -->
   <div class="sound-visualizer-container">
    <div class="youtube-visualizer-placeholder">
     <span>Audio playing from YouTube iframe</span>
    </div>
   </div>

   <div class="sound-controls-row">
    <div class="volume-control">
     <span class="volume-icon">
      <IconVolume size={16} stroke={1.5} />
     </span>
     <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={musicState.youtubeVolume}
      oninput={(e) =>
       setYoutubeVolume(parseFloat((e.target as HTMLInputElement).value))}
      class="volume-slider"
     />
     <span class="volume-value"
      >{Math.round(musicState.youtubeVolume * 100)}%</span
     >
    </div>
   </div>

   {#if youtubeExpanded}
    <div class="youtube-url-section">
     <p class="info-text">Change YouTube playlist (continues in background)</p>
     {#if showYoutubeInput}
      <input
       type="text"
       class="youtube-input"
       bind:value={tempYoutubeUrl}
       placeholder="Paste YouTube playlist URL"
       onblur={updateYoutubeUrl}
       onkeydown={(e) => e.key === "Enter" && updateYoutubeUrl()}
      />
     {:else}
      <div class="current-playlist">
       <span class="playlist-label">Playlist ID:</span>
       <span class="playlist-id">{musicState.playlistId || "None"}</span>
      </div>
      <button class="change-url-btn" onclick={handleEditUrl}>
       Change Playlist
      </button>
     {/if}
    </div>
   {/if}
  </div>
 </div>

 <!-- Ambient Sounds Section -->
 <div class="music-section">
  <h3 class="section-title">
   <IconVolume2
    size={20}
    stroke={1.5}
    style="display: inline-block; vertical-align: middle; margin-right: 8px;"
   />
   Ambient Sounds
  </h3>
  <div class="sounds-grid">
   {#each musicState.sounds as sound, index (sound.id)}
    {@const Icon = getSoundIcon(sound.icon)}
    <div class="sound-control">
     <div class="sound-header">
      <span class="sound-icon">
       <Icon size={20} stroke={1.5} />
      </span>
      <span class="sound-name">{sound.name}</span>
      <button
       class="sound-toggle"
       class:playing={sound.playing}
       onclick={() => toggleSound(index)}
      >
       {#if sound.playing}
        <IconPlayerPause size={16} stroke={1.5} />
       {:else}
        <IconPlayerPlay size={16} stroke={1.5} />
       {/if}
      </button>
     </div>

     <!-- Individual Visualizer -->
     {#if sound.playing && sound.analyser}
      <div class="sound-visualizer-container">
       <AudioVisualizer
        analyser={sound.analyser}
        width={280}
        height={40}
        barColor={getSoundColor(index)}
        barCount={24}
       />
      </div>
     {/if}

     <div class="sound-controls-row">
      <div class="volume-control">
       <span class="volume-icon">
        <IconVolume size={16} stroke={1.5} />
       </span>
       <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={sound.volume}
        oninput={(e) =>
         setSoundVolume(
          index,
          parseFloat((e.target as HTMLInputElement).value)
         )}
        class="volume-slider"
       />
       <span class="volume-value">{Math.round(sound.volume * 100)}%</span>
      </div>
     </div>
    </div>
   {/each}
  </div>
 </div>
</div>

<style>
 .music-player {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(
   135deg,
   rgba(203, 166, 247, 0.05),
   rgba(245, 194, 231, 0.05)
  );
 }

 .global-visualizer-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
 }

 .master-visualizer-wrapper {
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
 }

 .master-visualizer-wrapper :global(canvas) {
  max-width: 100%;
  height: auto;
 }

 .presets-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(203, 166, 247, 0.2);
  border-radius: 12px;
 }

 .presets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
 }

 .stop-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(243, 139, 168, 0.2);
  border: 1px solid rgba(243, 139, 168, 0.4);
  border-radius: 8px;
  color: #f38ba8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
 }

 .stop-all-btn:hover {
  background: rgba(243, 139, 168, 0.3);
  box-shadow: 0 0 10px rgba(243, 139, 168, 0.5);
 }

 .presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
 }

 .preset-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(203, 166, 247, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
 }

 .preset-btn:hover {
  background: rgba(203, 166, 247, 0.1);
  border-color: rgba(203, 166, 247, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(203, 166, 247, 0.3);
 }

 .preset-icon {
  font-size: 28px;
  line-height: 1;
  filter: drop-shadow(0 0 8px rgba(203, 166, 247, 0.6));
 }

 .preset-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
 }

 .preset-name {
  font-size: 14px;
  font-weight: 700;
  color: #cba6f7;
 }

 .preset-desc {
  font-size: 11px;
  color: #bac2de;
  opacity: 0.8;
 }

 .music-section {
  margin-bottom: 30px;
 }

 .youtube-section {
  margin-bottom: 30px;
 }

 .section-title {
  font-size: 18px;
  font-weight: 700;
  color: #cba6f7;
  margin: 0 0 15px 0;
  text-shadow: 0 0 10px rgba(203, 166, 247, 0.5);
 }

 .sounds-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
 }

 .sound-control {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(203, 166, 247, 0.2);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s;
 }

 .sound-control:hover {
  border-color: rgba(203, 166, 247, 0.4);
 }

 .youtube-control {
  background: linear-gradient(
   135deg,
   rgba(255, 0, 0, 0.05),
   rgba(203, 166, 247, 0.05)
  );
  border-color: rgba(255, 0, 0, 0.3);
 }

 .sound-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
 }

 .expand-toggle {
  background: rgba(203, 166, 247, 0.1);
  border: 1px solid rgba(203, 166, 247, 0.2);
  border-radius: 4px;
  color: #cba6f7;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
 }

 .expand-toggle:hover {
  background: rgba(203, 166, 247, 0.2);
 }

 .sound-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cba6f7;
 }

 .youtube-icon {
  color: #ff0000;
 }

 .sound-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #cdd6f4;
 }

 .sound-toggle {
  width: 32px;
  height: 32px;
  background: rgba(203, 166, 247, 0.2);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 6px;
  color: #cba6f7;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .sound-toggle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
 }

 .sound-toggle:hover:not(:disabled) {
  background: rgba(203, 166, 247, 0.3);
 }

 .sound-toggle.playing {
  background: rgba(203, 166, 247, 0.4);
  box-shadow: 0 0 10px rgba(203, 166, 247, 0.5);
 }

 .youtube-controls {
  display: flex;
  align-items: center;
  gap: 6px;
 }

 .youtube-skip-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 0, 0, 0.15);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 6px;
  color: #ff6666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .youtube-skip-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
 }

 .youtube-skip-btn:hover:not(:disabled) {
  background: rgba(255, 0, 0, 0.25);
  box-shadow: 0 0 8px rgba(255, 0, 0, 0.4);
 }

 .sound-visualizer-container {
  margin: 8px 0;
  display: flex;
  justify-content: center;
 }

 .youtube-visualizer-placeholder {
  width: 280px;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #bac2de;
  font-style: italic;
 }

 .sound-controls-row {
  display: flex;
  gap: 12px;
  align-items: center;
 }

 .volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
 }

 .volume-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cba6f7;
 }

 .volume-slider {
  flex: 1;
  height: 4px;
  background: rgba(203, 166, 247, 0.2);
  border-radius: 2px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
 }

 .volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #cba6f7;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(203, 166, 247, 0.8);
 }

 .volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #cba6f7;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(203, 166, 247, 0.8);
  border: none;
 }

 .volume-value {
  font-size: 12px;
  color: #cba6f7;
  min-width: 40px;
  text-align: right;
 }

 .youtube-url-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(203, 166, 247, 0.1);
 }

 .info-text {
  color: #bac2de;
  font-size: 12px;
  margin: 0 0 10px 0;
  font-style: italic;
 }

 .current-playlist {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
 }

 .playlist-label {
  color: #cba6f7;
  font-weight: 600;
  font-size: 12px;
 }

 .playlist-id {
  color: #89b4fa;
  font-family: monospace;
  font-size: 11px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
 }

 .youtube-input {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 0, 0, 0.3);
  border-radius: 6px;
  color: #ff6666;
  font-size: 12px;
  outline: none;
  margin-bottom: 10px;
 }

 .youtube-input:focus {
  border-color: #ff0000;
 }

 .change-url-btn {
  padding: 8px 16px;
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.4);
  border-radius: 6px;
  color: #ff6666;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
 }

 .change-url-btn:hover {
  background: rgba(255, 0, 0, 0.3);
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.4);
 }

 .music-player::-webkit-scrollbar {
  width: 8px;
 }

 .music-player::-webkit-scrollbar-track {
  background: rgba(203, 166, 247, 0.05);
 }

 .music-player::-webkit-scrollbar-thumb {
  background: rgba(203, 166, 247, 0.3);
  border-radius: 4px;
 }

 .music-player::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 166, 247, 0.5);
 }
</style>
