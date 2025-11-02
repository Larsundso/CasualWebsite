<script lang="ts">
 import { userStore } from "$lib/stores/userStore.svelte";
 import {
  GameDataType,
  GameTags,
  Genres,
  Platforms,
  type SupplementalGame,
 } from "$lib/types/discord";
 import IconArrowLeft from "@tabler/icons-svelte/icons/arrow-left";
 import IconBrandSteam from "@tabler/icons-svelte/icons/brand-steam";
 import IconCalendar from "@tabler/icons-svelte/icons/calendar";
 import IconUsers from "@tabler/icons-svelte/icons/users";
 import IconDeviceGamepad2 from "@tabler/icons-svelte/icons/device-gamepad-2";
 import IconExternalLink from "@tabler/icons-svelte/icons/external-link";
 import { slide, fade } from "svelte/transition";

 const userData = $derived(userStore.data);

 let currentView = $state<"list" | "detail">("list");
 let selectedGame = $state<SupplementalGame | null>(null);

 function selectGame(game: SupplementalGame) {
  selectedGame = game;
  currentView = "detail";
 }

 function backToList() {
  currentView = "list";
  selectedGame = null;
 }

 function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-US", {
   year: "numeric",
   month: "long",
   day: "numeric",
  });
 }

 function getGameCoverUrl(coverUrl: string) {
  return coverUrl || "https://via.placeholder.com/300x400?text=No+Image";
 }
</script>

<div class="games-window">
 {#if !userData}
  <div class="loading-state">
   <div class="spinner"></div>
   <p>Loading games...</p>
  </div>
 {:else if currentView === "list"}
  <!-- List View -->
  <div class="games-list-view" transition:fade={{ duration: 200 }}>
   <h2 class="main-title">
    <IconDeviceGamepad2 size={28} stroke={1.5} />
    My Games Collection
   </h2>

   {#if userData.games.supplemental_game_data && Array.isArray(userData.games.supplemental_game_data)}
    {#each userData.user.widgets as widget (widget.data.type)}
     {@const widgetGames = widget.data.games
      .map((g) => ({
       ...g,
       details: userData.games.supplemental_game_data.find(
        (sg) => sg.application_id === g.game_id
       ),
      }))
      .filter((g) => g.details)}

     {#if widgetGames.length > 0}
      <div class="game-category" transition:slide>
       <h3 class="category-title">{GameDataType[widget.data.type as never]}</h3>
       <div class="games-grid">
        {#each widgetGames as game (game.game_id)}
         {#if game.details}
          <button class="game-card" onclick={() => selectGame(game.details!)}>
           <div
            class="game-cover"
            style="background-image: url({getGameCoverUrl(
             game.details.cover_image_url
            )})"
           ></div>
           <div class="game-info">
            <strong class="game-title">{game.details.name}</strong>
            {#if game.comment}
             <p class="game-comment">"{game.comment}"</p>
            {/if}
            {#if game.tags.length > 0}
             <div class="game-tags">
              {#each game.tags as tag (tag)}
               <span class="tag">{GameTags[tag as never]}</span>
              {/each}
             </div>
            {/if}
           </div>
          </button>
         {/if}
        {/each}
       </div>
      </div>
     {/if}
    {/each}
   {:else}
    <div class="empty-state">
     <IconDeviceGamepad2 size={64} stroke={1} />
     <p>No games found</p>
    </div>
   {/if}
  </div>
 {:else if currentView === "detail" && selectedGame}
  <!-- Detail View -->
  <div class="game-detail-view" transition:fade={{ duration: 200 }}>
   <button class="back-button" onclick={backToList}>
    <IconArrowLeft size={20} stroke={1.5} />
    Back to List
   </button>

   <div class="detail-content">
    <!-- Header Section -->
    <div class="detail-header">
     <div
      class="detail-cover"
      style="background-image: url({getGameCoverUrl(
       selectedGame.cover_image_url
      )})"
     ></div>
     <div class="detail-header-info">
      <h1 class="detail-title">
       {selectedGame.name}
      </h1>

      <!-- Metadata -->
      <div class="metadata-grid">
       {#if selectedGame.first_release_date}
        <div class="metadata-item">
         <IconCalendar size={18} stroke={1.5} />
         <div>
          <span class="metadata-label">Release Date</span>
          <span class="metadata-value"
           >{formatDate(selectedGame.first_release_date)}</span
          >
         </div>
        </div>
       {/if}

       {#if selectedGame.developer_name?.length > 0}
        <div class="metadata-item">
         <IconUsers size={18} stroke={1.5} />
         <div>
          <span class="metadata-label">Developer</span>
          <span class="metadata-value"
           >{selectedGame.developer_name.join(", ")}</span
          >
         </div>
        </div>
       {/if}

       {#if selectedGame.publisher_names?.length > 0}
        <div class="metadata-item">
         <IconUsers size={18} stroke={1.5} />
         <div>
          <span class="metadata-label">Publisher</span>
          <span class="metadata-value"
           >{selectedGame.publisher_names.join(", ")}</span
          >
         </div>
        </div>
       {/if}
      </div>

      <!-- Steam Link -->
      {#if selectedGame.steam_id}
       <a
        href="https://store.steampowered.com/app/{selectedGame.steam_id}"
        target="_blank"
        rel="noopener noreferrer"
        class="steam-link"
       >
        <IconBrandSteam size={20} stroke={1.5} />
        View on Steam
        <IconExternalLink size={16} stroke={1.5} />
       </a>
      {/if}
     </div>
    </div>

    <!-- Summary -->
    {#if selectedGame.summary}
     <div class="detail-section">
      <h3>About</h3>
      <p class="game-summary">
       {selectedGame.summary}
      </p>
     </div>
    {/if}

    <!-- Genres & Platforms -->
    <div class="detail-section">
     <div class="info-columns">
      {#if selectedGame.genres?.length > 0}
       <div class="info-column">
        <h3>Genres</h3>
        <div class="genre-tags">
         {#each selectedGame.genres as genre (genre)}
          <span class="genre-tag">{Genres[genre] || "Unknown"}</span>
         {/each}
        </div>
       </div>
      {/if}

      {#if selectedGame.platforms?.length > 0}
       <div class="info-column">
        <h3>Platforms</h3>
        <div class="platform-tags">
         {#each selectedGame.platforms as platform (platform)}
          {#if Platforms[platform]}
           <span class="platform-tag">{Platforms[platform]}</span>
          {/if}
         {/each}
        </div>
       </div>
      {/if}
     </div>
    </div>

    <!-- Screenshots -->
    {#if selectedGame.screenshot_urls?.length > 0}
     <div class="detail-section">
      <h3>Screenshots</h3>
      <div class="screenshots-grid">
       {#each selectedGame.screenshot_urls as screenshot (screenshot)}
        <div
         class="screenshot"
         style="background-image: url({screenshot})"
        ></div>
       {/each}
      </div>
     </div>
    {/if}

    <!-- Artwork -->
    {#if selectedGame.artwork_urls?.length > 0}
     <div class="detail-section">
      <h3>Artwork</h3>
      <div class="artwork-grid">
       {#each selectedGame.artwork_urls as artwork (artwork)}
        <div class="artwork" style="background-image: url({artwork})"></div>
       {/each}
      </div>
     </div>
    {/if}

    <!-- Websites -->
    {#if selectedGame.websites?.length > 0}
     <div class="detail-section">
      <h3>Links</h3>
      <div class="websites-list">
       {#each selectedGame.websites as website (website.url)}
        <a
         href={website.url}
         target="_blank"
         rel="noopener noreferrer"
         class="website-link"
        >
         {website.url}
         <IconExternalLink size={14} stroke={1.5} />
        </a>
       {/each}
      </div>
     </div>
    {/if}
   </div>
  </div>
 {/if}
</div>

<style>
 .games-window {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(
   135deg,
   rgba(137, 180, 250, 0.05),
   rgba(203, 166, 247, 0.05)
  );
 }

 /* Loading State */
 .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #cdd6f4;
 }

 .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(137, 180, 250, 0.2);
  border-top-color: #89b4fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
 }

 @keyframes spin {
  to {
   transform: rotate(360deg);
  }
 }

 /* List View */
 .games-list-view {
  padding: 20px;
 }

 .main-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #89b4fa;
  margin: 0 0 30px 0;
  text-shadow: 0 0 10px rgba(137, 180, 250, 0.5);
 }

 .game-category {
  margin-bottom: 32px;
 }

 .category-title {
  font-size: 20px;
  font-weight: 700;
  color: #cba6f7;
  margin: 0 0 16px 0;
  padding-left: 4px;
  border-left: 4px solid #cba6f7;
 }

 .games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
 }

 .game-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(137, 180, 250, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  text-align: left;
  padding: 0;
 }

 .game-card:hover {
  transform: translateY(-4px);
  border-color: rgba(137, 180, 250, 0.5);
  box-shadow: 0 8px 24px rgba(137, 180, 250, 0.3);
 }

 .game-cover {
  width: 100%;
  height: 240px;
  background-size: cover;
  background-position: center;
  background-color: rgba(137, 180, 250, 0.1);
 }

 .game-info {
  padding: 12px;
 }

 .game-title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #cdd6f4;
  margin-bottom: 6px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
 }

 .game-comment {
  font-style: italic;
  color: #89b4fa;
  font-size: 11px;
  margin: 6px 0;
  line-height: 1.4;
 }

 .game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
 }

 .tag {
  padding: 3px 8px;
  background: rgba(203, 166, 247, 0.2);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
  color: #cba6f7;
 }

 .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #bac2de;
  opacity: 0.6;
 }

 .empty-state p {
  margin-top: 16px;
  font-size: 16px;
 }

 /* Detail View */
 .game-detail-view {
  height: 100%;
  display: flex;
  flex-direction: column;
 }

 .back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(137, 180, 250, 0.1);
  border: none;
  border-bottom: 1px solid rgba(137, 180, 250, 0.2);
  color: #89b4fa;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
 }

 .back-button:hover {
  background: rgba(137, 180, 250, 0.2);
 }

 .detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
 }

 .detail-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
 }

 .detail-cover {
  flex-shrink: 0;
  width: 280px;
  height: 373px;
  background-size: cover;
  background-position: center;
  background-color: rgba(137, 180, 250, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
 }

 .detail-header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
 }

 .detail-title {
  font-size: 32px;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
  line-height: 1.2;
 }

 .user-comment {
  font-size: 16px;
  color: #89b4fa;
  font-style: italic;
  padding: 12px;
  background: rgba(137, 180, 250, 0.1);
  border-left: 3px solid #89b4fa;
  border-radius: 6px;
 }

 .detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
 }

 .detail-tag {
  padding: 6px 14px;
  background: rgba(203, 166, 247, 0.2);
  border: 1px solid rgba(203, 166, 247, 0.4);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #cba6f7;
  text-transform: uppercase;
 }

 .metadata-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
 }

 .metadata-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #89b4fa;
 }

 .metadata-item > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
 }

 .metadata-label {
  font-size: 11px;
  font-weight: 600;
  color: #89b4fa;
  text-transform: uppercase;
  opacity: 0.8;
 }

 .metadata-value {
  font-size: 13px;
  color: #cdd6f4;
 }

 .steam-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(
   135deg,
   rgba(23, 26, 33, 0.9),
   rgba(16, 29, 44, 0.9)
  );
  border: 1px solid rgba(102, 192, 244, 0.3);
  border-radius: 8px;
  color: #66c0f4;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
 }

 .steam-link:hover {
  background: linear-gradient(135deg, rgba(23, 26, 33, 1), rgba(16, 29, 44, 1));
  border-color: #66c0f4;
  box-shadow: 0 6px 20px rgba(102, 192, 244, 0.4);
  transform: translateY(-2px);
 }

 .detail-section {
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(137, 180, 250, 0.1);
 }

 .detail-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: #cba6f7;
  margin: 0 0 16px 0;
 }

 .game-summary {
  color: #cdd6f4;
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
 }

 .info-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
 }

 .info-column h3 {
  font-size: 16px;
  margin-bottom: 12px;
 }

 .genre-tags,
 .platform-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
 }

 .genre-tag {
  padding: 6px 12px;
  background: rgba(137, 180, 250, 0.2);
  border: 1px solid rgba(137, 180, 250, 0.3);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
 }

 .platform-tag {
  padding: 6px 12px;
  background: rgba(166, 227, 161, 0.2);
  border: 1px solid rgba(166, 227, 161, 0.3);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #a6e3a1;
 }

 .screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
 }

 .screenshot {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  background-color: rgba(137, 180, 250, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(137, 180, 250, 0.2);
  transition: all 0.3s;
  cursor: pointer;
 }

 .screenshot:hover {
  transform: scale(1.03);
  border-color: rgba(137, 180, 250, 0.5);
  box-shadow: 0 8px 24px rgba(137, 180, 250, 0.3);
 }

 .artwork-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
 }

 .artwork {
  width: 100%;
  height: 160px;
  background-size: cover;
  background-position: center;
  background-color: rgba(203, 166, 247, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(203, 166, 247, 0.2);
  transition: all 0.3s;
  cursor: pointer;
 }

 .artwork:hover {
  transform: scale(1.03);
  border-color: rgba(203, 166, 247, 0.5);
  box-shadow: 0 8px 24px rgba(203, 166, 247, 0.3);
 }

 .websites-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
 }

 .website-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(137, 180, 250, 0.1);
  border: 1px solid rgba(137, 180, 250, 0.2);
  border-radius: 8px;
  color: #89b4fa;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
 }

 .website-link:hover {
  background: rgba(137, 180, 250, 0.2);
  border-color: rgba(137, 180, 250, 0.4);
 }

 /* Scrollbar */
 .games-window::-webkit-scrollbar,
 .detail-content::-webkit-scrollbar {
  width: 8px;
 }

 .games-window::-webkit-scrollbar-track,
 .detail-content::-webkit-scrollbar-track {
  background: rgba(137, 180, 250, 0.05);
 }

 .games-window::-webkit-scrollbar-thumb,
 .detail-content::-webkit-scrollbar-thumb {
  background: rgba(137, 180, 250, 0.3);
  border-radius: 4px;
 }

 .games-window::-webkit-scrollbar-thumb:hover,
 .detail-content::-webkit-scrollbar-thumb:hover {
  background: rgba(137, 180, 250, 0.5);
 }
</style>
