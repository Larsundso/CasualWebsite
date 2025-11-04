<svelte:options runes={true} />

<script lang="ts">
 import { userStore } from "$lib/stores/userStore.svelte";
 import { PremiumType, Genres } from "$lib/types/discord";
 import IconBrandSteam from "@tabler/icons-svelte/icons/brand-steam";
 import IconBrandYoutube from "@tabler/icons-svelte/icons/brand-youtube";
 import IconBrandTwitch from "@tabler/icons-svelte/icons/brand-twitch";
 import IconBrandGithub from "@tabler/icons-svelte/icons/brand-github";
 import IconBrandX from "@tabler/icons-svelte/icons/brand-x";
 import IconBrandSpotify from "@tabler/icons-svelte/icons/brand-spotify";
 import IconBrandXbox from "@tabler/icons-svelte/icons/brand-xbox";
 import IconPlaystationCircle from "@tabler/icons-svelte/icons/playstation-circle";
 import IconBrandReddit from "@tabler/icons-svelte/icons/brand-reddit";
 import IconBrandFacebook from "@tabler/icons-svelte/icons/brand-facebook";
 import IconBrandInstagram from "@tabler/icons-svelte/icons/brand-instagram";
 import IconLink from "@tabler/icons-svelte/icons/link";
 import IconBrandDiscord from "@tabler/icons-svelte/icons/brand-discord";
 import IconBrandTiktok from "@tabler/icons-svelte/icons/brand-tiktok";
 import IconDiamondFilled from "@tabler/icons-svelte/icons/diamond-filled";
 import type { ComponentType } from "svelte";

 const userData = $derived(userStore.data);

 const getAvatarUrl = (userId: string, avatar: string | null) => {
  if (!avatar) {
   const defaultAvatarIndex = parseInt(userId) % 5;
   return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
  }
  const ext = avatar.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${ext}?size=256`;
 };

 const getBannerUrl = (userId: string, banner: string | null) => {
  if (!banner) return null;
  const ext = banner.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/banners/${userId}/${banner}.${ext}?size=1024`;
 };

 const getBadgeUrl = (icon: string) => {
  return `https://cdn.discordapp.com/badge-icons/${icon}.png`;
 };

 const getClanBadgeUrl = (identityGuildId: string, badge: string) => {
  return `https://cdn.discordapp.com/clan-badges/${identityGuildId}/${badge}.png?size=64`;
 };

 const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("en-US", {
   year: "numeric",
   month: "long",
   day: "numeric",
  });
 };

 const getConnectionIcon = (type: string): ComponentType => {
  const icons: Record<string, ComponentType> = {
   steam: IconBrandSteam,
   youtube: IconBrandYoutube,
   twitch: IconBrandTwitch,
   github: IconBrandGithub,
   twitter: IconBrandX,
   x: IconBrandX,
   spotify: IconBrandSpotify,
   xbox: IconBrandXbox,
   playstation: IconPlaystationCircle,
   reddit: IconBrandReddit,
   facebook: IconBrandFacebook,
   instagram: IconBrandInstagram,
   discord: IconBrandDiscord,
   tiktok: IconBrandTiktok,
  };
  return icons[type.toLowerCase()] || IconLink;
 };

 const getConnectionUrl = (type: string, name: string): string | null => {
  if (type.toLowerCase() === "domain") {
   if (!name.startsWith("http://") && !name.startsWith("https://")) {
    return `https://${name}`;
   }
   return name;
  }

  if (type.toLowerCase() === "steam") {
   return "https://steamcommunity.com/id/Lars_und_so/";
  }

  const urls: Record<string, (name: string) => string> = {
   github: (name) => `https://github.com/${name}`,
   twitter: (name) => `https://twitter.com/${name}`,
   x: (name) => `https://twitter.com/${name}`,
   youtube: (name) => `https://youtube.com/@${name}`,
   twitch: (name) => `https://twitch.tv/${name}`,
   reddit: (name) => `https://reddit.com/user/${name}`,
   instagram: (name) => `https://instagram.com/${name}`,
   facebook: (name) => `https://facebook.com/${name}`,
   tiktok: (name) => `https://tiktok.com/@${name}`,
  };

  const urlBuilder = urls[type.toLowerCase()];
  return urlBuilder ? urlBuilder(name) : null;
 };

 const getGameCoverUrl = (coverUrl: string) => {
  return coverUrl || "https://via.placeholder.com/90x120?text=No+Image";
 };
</script>

<div class="profile-window">
 {#if !userData}
  <div class="loading-state">
   <div class="spinner"></div>
   <p>Loading profile...</p>
  </div>
 {:else}
  <!-- Profile Banner and Avatar -->
  <div
   class="profile-banner"
   style={userData.user.user_profile.banner
    ? `background-image: url(${getBannerUrl(userData.user.user.id, userData.user.user_profile.banner)})`
    : "background-color: rgba(203, 166, 247, 0.2)"}
  >
   <div
    class="profile-avatar"
    style="background-image: url({getAvatarUrl(
     userData.user.user.id,
     userData.user.user.avatar
    )})"
   ></div>
  </div>

  <div class="profile-content">
   <!-- Profile Header -->
   <div class="profile-header">
    <div class="profile-name">
     <h2>{userData.user.user.global_name || userData.user.user.username}</h2>
     <p class="username">@{userData.user.user.username}</p>
     {#if userData.user.user_profile.pronouns}
      <p class="pronouns">{userData.user.user_profile.pronouns}</p>
     {/if}
     {#if userData.user.premium_type > 0}
      <div class="nitro-badge">
       <IconDiamondFilled size={16} />
       {PremiumType[userData.user.premium_type]}
      </div>
     {/if}
    </div>

    <!-- Badges -->
    {#if userData.user.badges.length > 0}
     <div class="profile-badges">
      {#each userData.user.badges as badge (badge.id)}
       <div class="badge" title={badge.description}>
        <img src={getBadgeUrl(badge.icon)} alt={badge.description} />
       </div>
      {/each}
     </div>
    {/if}
   </div>

   <!-- About Me -->
   <div class="profile-section">
    <h3>About Me</h3>
    <p class="bio">{userData.user.user_profile.bio || "No bio set"}</p>
    {#if userData.user.premium_since}
     <p class="member-since">
      Nitro subscriber since: {formatDate(userData.user.premium_since)}
     </p>
    {/if}
   </div>

   <!-- Connected Accounts -->
   {#if userData.connections.length > 0}
    <div class="profile-section">
     <h3>Connected Accounts</h3>
     <div class="connections-grid">
      {#each userData.connections as connection (connection.type + connection.name)}
       {@const Icon = getConnectionIcon(connection.type)}
       {@const url = getConnectionUrl(connection.type, connection.name)}
       {#if url}
        <a
         href={url}
         target="_blank"
         rel="noopener noreferrer"
         class="connection-card connection-link"
        >
         <div class="connection-icon">
          <Icon size={32} stroke={1.5} />
         </div>
         <div class="connection-info">
          <strong>{connection.type}</strong>
          <p>{connection.name}</p>
          {#if connection.metadata?.game_count}
           <span class="connection-meta"
            >{connection.metadata.game_count} games</span
           >
          {/if}
         </div>
        </a>
       {:else}
        <div class="connection-card">
         <div class="connection-icon">
          <Icon size={32} stroke={1.5} />
         </div>
         <div class="connection-info">
          <strong>{connection.type}</strong>
          <p>{connection.name}</p>
          {#if connection.metadata?.game_count}
           <span class="connection-meta"
            >{connection.metadata.game_count} games</span
           >
          {/if}
         </div>
        </div>
       {/if}
      {/each}
     </div>
    </div>
   {/if}

   <!-- Game Widgets -->
   {#if userData.games && Array.isArray(userData.games)}
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
      <div class="profile-section">
       <h3>{widget.data.type}</h3>
       <div class="games-grid">
        {#each widgetGames as game (game.game_id)}
         {#if game.details}
          <div class="game-card">
           <div
            class="game-cover"
            style="background-image: url({getGameCoverUrl(
             game.details.cover_image_url
            )})"
           ></div>
           <div class="game-details">
            <strong>{game.details.name}</strong>
            {#if game.comment}
             <p class="game-comment">"{game.comment}"</p>
            {/if}
            {#if game.tags.length > 0}
             <div class="game-tags">
              {#each game.tags as tag (tag)}
               <span class="tag">{tag}</span>
              {/each}
             </div>
            {/if}
            {#if game.details.genres.length > 0}
             <div class="game-genres">
              {#each game.details.genres as genre (genre)}
               <span class="genre-tag">{Genres[genre] || "Unknown"}</span>
              {/each}
             </div>
            {/if}
           </div>
          </div>
         {/if}
        {/each}
       </div>
      </div>
     {/if}
    {/each}
   {/if}

   <!-- Clan Info -->
   {#if userData.user.clan}
    <div class="profile-section">
     <h3>Clan</h3>
     <div class="clan-card">
      <img
       src="https://cdn.discordapp.com/clan-badges/{userData.user.clan
        .identity_guild_id}/{userData.user.clan.badge}.png?size=128"
       alt="Clan badge"
       class="clan-badge"
      />
      <p class="clan-tag">{userData.user.clan.tag}</p>
     </div>
    </div>
   {/if}
  </div>
 {/if}
</div>

<style>
 .profile-window {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(
   135deg,
   rgba(203, 166, 247, 0.05),
   rgba(137, 180, 250, 0.05)
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
  border: 4px solid rgba(203, 166, 247, 0.2);
  border-top-color: #cba6f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
 }

 @keyframes spin {
  to {
   transform: rotate(360deg);
  }
 }

 /* Banner and Avatar */
 .profile-banner {
  height: 120px;
  background-size: cover;
  background-position: center;
  background-color: rgba(203, 166, 247, 0.2);
  position: relative;
 }

 .profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(30, 30, 46, 0.95);
  background-size: cover;
  background-position: center;
  background-color: rgba(137, 180, 250, 0.3);
  position: absolute;
  bottom: -40px;
  left: 20px;
 }

 /* Profile Content */
 .profile-content {
  padding: 50px 20px 20px 20px;
 }

 .profile-header {
  margin-bottom: 20px;
 }

 .profile-name h2 {
  font-size: 24px;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
 }

 .username {
  color: #89b4fa;
  font-size: 14px;
  margin: 4px 0;
 }

 .pronouns {
  color: #cba6f7;
  font-size: 12px;
  margin: 4px 0;
 }

 .nitro-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: linear-gradient(
   135deg,
   rgba(203, 166, 247, 0.3),
   rgba(137, 180, 250, 0.3)
  );
  border: 1px solid rgba(203, 166, 247, 0.5);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #cba6f7;
  margin-top: 8px;
 }

 .profile-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
 }

 .badge {
  width: 24px;
  height: 24px;
  cursor: help;
 }

 .badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
 }

 /* Profile Sections */
 .profile-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(205, 214, 244, 0.1);
 }

 .profile-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #cba6f7;
  margin: 0 0 12px 0;
 }

 .bio {
  color: #cdd6f4;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
 }

 .member-since {
  color: #89b4fa;
  font-size: 12px;
  margin-top: 8px !important;
 }

 /* Connections */
 .connections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
 }

 .connection-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(137, 180, 250, 0.2);
  border-radius: 8px;
  transition: all 0.2s;
 }

 .connection-link {
  text-decoration: none;
  cursor: pointer;
 }

 .connection-link:hover {
  background: rgba(137, 180, 250, 0.1);
  border-color: rgba(137, 180, 250, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(137, 180, 250, 0.2);
 }

 .connection-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #89b4fa;
 }

 .connection-info {
  flex: 1;
  min-width: 0;
 }

 .connection-info strong {
  display: block;
  font-size: 12px;
  color: #89b4fa;
  text-transform: capitalize;
  margin-bottom: 2px;
 }

 .connection-info p {
  font-size: 13px;
  color: #cdd6f4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
 }

 .connection-meta {
  font-size: 11px;
  color: #cba6f7;
 }

 /* Games Grid */
 .games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
 }

 .game-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(137, 180, 250, 0.2);
  border-radius: 8px;
  overflow: hidden;
  transition:
   transform 0.2s,
   border-color 0.2s;
 }

 .game-card:hover {
  transform: translateY(-2px);
  border-color: rgba(203, 166, 247, 0.4);
 }

 .game-cover {
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  background-color: rgba(137, 180, 250, 0.1);
 }

 .game-details {
  padding: 12px;
 }

 .game-details strong {
  display: block;
  font-size: 14px;
  color: #cdd6f4;
  margin-bottom: 6px;
  line-height: 1.3;
 }

 .game-comment {
  font-style: italic;
  color: #89b4fa;
  font-size: 12px;
  margin: 6px 0;
  line-height: 1.4;
 }

 .game-tags,
 .game-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
 }

 .tag {
  padding: 2px 8px;
  background: rgba(203, 166, 247, 0.2);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #cba6f7;
 }

 .genre-tag {
  padding: 2px 8px;
  background: rgba(137, 180, 250, 0.2);
  border: 1px solid rgba(137, 180, 250, 0.3);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #89b4fa;
 }

 /* Clan */
 .clan-card {
  display: flex;
  align-items: center;
  gap: 12px;
 }

 .clan-badge {
  width: 48px;
  height: 48px;
  object-fit: contain;
 }

 .clan-tag {
  font-size: 16px;
  font-weight: 700;
  color: #cba6f7;
  margin: 0;
 }

 /* Scrollbar */
 .profile-window::-webkit-scrollbar {
  width: 8px;
 }

 .profile-window::-webkit-scrollbar-track {
  background: rgba(203, 166, 247, 0.05);
 }

 .profile-window::-webkit-scrollbar-thumb {
  background: rgba(203, 166, 247, 0.3);
  border-radius: 4px;
 }

 .profile-window::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 166, 247, 0.5);
 }
</style>
