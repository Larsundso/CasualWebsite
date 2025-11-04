<svelte:options runes={true} />

<script lang="ts">
 import type { GETUser } from "$lib/api/fetchUserData";
 import type { Application } from "$lib/types/discord";
 import { userStore } from "$lib/stores/userStore.svelte";
 import IconBrandDiscord from "@tabler/icons-svelte/icons/brand-discord";
 import IconCheck from "@tabler/icons-svelte/icons/check";
 import IconServer from "@tabler/icons-svelte/icons/server";
 import IconUsers from "@tabler/icons-svelte/icons/users";
 import IconRobot from "@tabler/icons-svelte/icons/robot";
 import IconWorld from "@tabler/icons-svelte/icons/world";
 import IconExternalLink from "@tabler/icons-svelte/icons/external-link";

 const userData = $derived(userStore.data);
 const apps = $derived(userData?.apps || []);

 function getAppIconUrl(app: Application): string | null {
  if (!app.icon) return null;
  return `https://cdn.discordapp.com/app-icons/${app.id}/${app.icon}.png?size=256`;
 }

 function getBotAvatarUrl(app: Application): string | null {
  if (!app.bot?.avatar) return null;
  const extension = app.bot.avatar.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/avatars/${app.bot.id}/${app.bot.avatar}.${extension}?size=128`;
 }

 function getAppInitials(name: string): string {
  return name
   .split(" ")
   .map((word) => word[0])
   .slice(0, 2)
   .join("")
   .toUpperCase();
 }
</script>

<div class="apps-window">
 <h2 class="apps-title">Discord Applications</h2>
 {#if !userData}
  <div class="loading">Loading applications...</div>
 {:else if apps.length === 0}
  <div class="no-apps">No applications found</div>
 {:else}
  <div class="apps-grid">
   {#each apps as app (app.id)}
    {@const iconUrl = getAppIconUrl(app)}
    {@const botAvatarUrl = getBotAvatarUrl(app)}
    <div class="app-card">
     <div class="app-header">
      <div class="app-icon">
       {#if iconUrl}
        <img src={iconUrl} alt={app.name} class="app-icon-img" />
       {:else}
        <div class="app-icon-fallback">
         <IconBrandDiscord size={32} stroke={1.5} />
        </div>
       {/if}
      </div>
      <div class="app-badges">
       {#if app.is_verified}
        <div class="badge verified" data-tooltip="Verified App">
         <IconCheck size={16} stroke={2.5} />
        </div>
       {/if}
       {#if app.is_discoverable}
        <div class="badge discoverable" data-tooltip="Discoverable">
         <IconWorld size={16} stroke={2} />
        </div>
       {/if}
      </div>
     </div>

     <div class="app-info">
      <h3 class="app-name">{app.name}</h3>

      {#if app.summary}
       <div class="app-text-section">
        <span class="text-label">Summary</span>
        <p class="app-summary">{app.summary}</p>
       </div>
      {/if}

      {#if app.description}
       <div class="app-text-section">
        <span class="text-label">Description</span>
        <p class="app-description">{app.description}</p>
       </div>
      {/if}

      {#if app.bot}
       <div class="bot-info">
        <div class="bot-avatar">
         {#if botAvatarUrl}
          <img src={botAvatarUrl} alt={app.bot.username} />
         {:else}
          <div class="bot-avatar-fallback">
           <IconRobot size={16} stroke={1.5} />
          </div>
         {/if}
        </div>
        <span class="bot-name">{app.bot.username}#{app.bot.discriminator}</span>
       </div>
      {/if}

      <div class="app-stats">
       <span class="stat" title="Servers">
        <IconServer size={14} stroke={1.5} />
        {app.approximate_guild_count?.toLocaleString() || "N/A"}
       </span>
       <span class="stat" title="User installs">
        <IconUsers size={14} stroke={1.5} />
        {app.approximate_user_install_count?.toLocaleString() || "N/A"}
       </span>
      </div>

      {#if app.is_discoverable}
       <a
        href="https://discord.com/discovery/applications/{app.id}"
        target="_blank"
        rel="noopener noreferrer"
        class="discovery-link"
       >
        <IconExternalLink size={16} stroke={2} />
        View on Discord Discovery
       </a>
      {/if}
     </div>
    </div>
   {/each}
  </div>
 {/if}
</div>

<style>
 .apps-window {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(
   135deg,
   rgba(203, 166, 247, 0.05),
   rgba(245, 194, 231, 0.05)
  );
 }

 .apps-title {
  font-size: 24px;
  font-weight: 700;
  color: #cba6f7;
  margin: 0 0 20px 0;
  text-shadow: 0 0 10px rgba(203, 166, 247, 0.5);
 }

 .loading,
 .no-apps {
  text-align: center;
  padding: 40px;
  color: #bac2de;
  font-size: 16px;
 }

 .apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
 }

 @media (max-width: 768px) {
  .apps-grid {
   grid-template-columns: 1fr;
   gap: 12px;
  }
 }

 .app-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(203, 166, 247, 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
 }

 .app-card:hover {
  transform: translateY(-4px);
  border-color: #cba6f7;
  box-shadow: 0 8px 25px rgba(203, 166, 247, 0.3);
  background: rgba(203, 166, 247, 0.05);
 }

 .app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
 }

 .app-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid rgba(203, 166, 247, 0.3);
  background: rgba(203, 166, 247, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .app-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .app-icon-fallback {
  font-size: 32px;
  color: #cba6f7;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .app-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
 }

 .badge {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  transition: all 0.2s;
  position: relative;
  cursor: help;
 }

 .badge[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background: rgba(17, 17, 27, 0.95);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
 }

 .badge[data-tooltip]:hover::after {
  opacity: 1;
 }

 .badge[data-tooltip]::before {
  content: "";
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(203, 166, 247, 0.3);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 999;
 }

 .badge[data-tooltip]:hover::before {
  opacity: 1;
 }

 .badge.verified {
  background: rgba(166, 227, 161, 0.2);
  border-color: rgba(166, 227, 161, 0.4);
  color: #a6e3a1;
 }

 .badge.verified:hover {
  background: rgba(166, 227, 161, 0.3);
  box-shadow: 0 0 10px rgba(166, 227, 161, 0.5);
 }

 .badge.discoverable {
  background: rgba(137, 180, 250, 0.2);
  border-color: rgba(137, 180, 250, 0.4);
  color: #89b4fa;
 }

 .badge.discoverable:hover {
  background: rgba(137, 180, 250, 0.3);
  box-shadow: 0 0 10px rgba(137, 180, 250, 0.5);
 }

 .app-info {
  text-align: left;
 }

 .app-name {
  font-size: 16px;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
 }

 .app-text-section {
  margin-bottom: 12px;
 }

 .text-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #cba6f7;
  margin-bottom: 4px;
 }

 .app-summary {
  font-size: 13px;
  color: #bac2de;
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
 }

 .app-description {
  font-size: 13px;
  color: #a6adc8;
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
 }

 .bot-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(137, 180, 250, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(137, 180, 250, 0.2);
 }

 .bot-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(137, 180, 250, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
 }

 .bot-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .bot-avatar-fallback {
  color: #89b4fa;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .bot-name {
  font-size: 12px;
  color: #89b4fa;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
 }

 .app-stats {
  display: flex;
  flex-direction: row;
  gap: 12px;
 }

 .stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #bac2de;
 }

 .discovery-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 14px;
  background: linear-gradient(
   135deg,
   rgba(137, 180, 250, 0.2),
   rgba(116, 199, 236, 0.2)
  );
  border: 1px solid rgba(137, 180, 250, 0.4);
  border-radius: 8px;
  color: #89b4fa;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
 }

 .discovery-link:hover {
  background: linear-gradient(
   135deg,
   rgba(137, 180, 250, 0.3),
   rgba(116, 199, 236, 0.3)
  );
  border-color: #89b4fa;
  box-shadow: 0 4px 12px rgba(137, 180, 250, 0.3);
  transform: translateY(-2px);
 }

 .discovery-link:active {
  transform: translateY(0);
 }

 .apps-window::-webkit-scrollbar {
  width: 8px;
 }

 .apps-window::-webkit-scrollbar-track {
  background: rgba(203, 166, 247, 0.05);
 }

 .apps-window::-webkit-scrollbar-thumb {
  background: rgba(203, 166, 247, 0.3);
  border-radius: 4px;
 }

 .apps-window::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 166, 247, 0.5);
 }

 /* Mobile */
 @media (max-width: 768px) {
  .apps-window {
   padding: 12px;
  }

  .apps-title {
   font-size: 20px;
   margin-bottom: 16px;
  }

  .app-card {
   border-radius: 8px;
  }

  .app-header {
   flex-direction: column;
   align-items: center;
   gap: 12px;
  }

  .app-icon {
   width: 80px;
   height: 80px;
  }

  .app-badges {
   justify-content: center;
  }

  .badge {
   width: 36px;
   height: 36px;
  }

  .app-info {
   text-align: center;
  }

  .app-name {
   font-size: 18px;
   white-space: normal;
   text-align: center;
  }

  .app-summary {
   text-align: center;
  }

  .app-description {
   text-align: center;
  }

  .text-label {
   text-align: center;
  }

  .bot-info {
   justify-content: center;
  }

  .app-stats {
   justify-content: center;
   gap: 16px;
  }

  .stat {
   font-size: 14px;
  }

  .discovery-link {
   width: 100%;
   justify-content: center;
   padding: 10px 16px;
   font-size: 14px;
  }

  .badge[data-tooltip]::after {
   font-size: 13px;
   padding: 8px 12px;
  }
 }
</style>
