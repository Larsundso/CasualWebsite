<svelte:options runes={true} />

<script lang="ts">
 import type { GETUser } from "$lib/api/fetchUserData";
 import type { Guild, ExtendedGuild } from "$lib/types/discord";
 import { userStore } from "$lib/stores/userStore.svelte";
 import IconCrown from "@tabler/icons-svelte/icons/crown";
 import IconShield from "@tabler/icons-svelte/icons/shield";
 import IconSettings from "@tabler/icons-svelte/icons/settings";
 import IconUsers from "@tabler/icons-svelte/icons/users";
 import IconUserCircle from "@tabler/icons-svelte/icons/user-circle";
 import IconStar from "@tabler/icons-svelte/icons/star";
 import IconSparkles from "@tabler/icons-svelte/icons/sparkles";
 import IconExternalLink from "@tabler/icons-svelte/icons/external-link";

 const userData = $derived(userStore.data);

 const guilds = $derived.by(() => {
  if (!userData?.guilds || !userData?.guildDetails) return [];

  return userData.guilds.map((guild) => {
   const details = userData!.guildDetails.find((d) => d.id === guild.id);
   return {
    ...guild,
    ...details,
   };
  });
 });

 type MergedGuild = Guild & Partial<ExtendedGuild>;

 function getGuildIconUrl(guild: MergedGuild): string | null {
  if (!guild.icon) return null;
  const extension = guild.icon.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${extension}?size=128`;
 }

 function getGuildBannerUrl(guild: MergedGuild): string | null {
  if (!guild.banner) return null;
  const extension = guild.banner.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${extension}?size=480`;
 }

 function getClanBadgeUrl(guild: MergedGuild): string | null {
  if (!guild.profile?.badge) return null;
  return `https://cdn.discordapp.com/clan-badges/${guild.id}/${guild.profile.badge}.png?size=128`;
 }

 function getPremiumTierLabel(tier: number): string {
  const tiers = ["None", "Tier 1", "Tier 2", "Tier 3"];
  return tiers[tier] || "Unknown";
 }

 function getBoostProgress(count: number): number {
  return Math.min((count / 16) * 100, 100);
 }

 function openVanityUrl(vanityCode: string | null) {
  if (vanityCode) {
   window.open(`https://discord.gg/${vanityCode}`, "_blank");
  }
 }

 function hasAdminPermission(permissions: string): boolean {
  return (BigInt(permissions) & 8n) === 8n;
 }

 function hasManageGuildPermission(permissions: string): boolean {
  return (BigInt(permissions) & 32n) === 32n;
 }

 function getGuildInitials(name: string): string {
  return name
   .split(" ")
   .map((word) => word[0])
   .slice(0, 2)
   .join("")
   .toUpperCase();
 }
</script>

<div class="servers-window">
 <h2 class="servers-title">Discord Servers</h2>
 {#if !userData}
  <div class="loading">Loading servers...</div>
 {:else if guilds.length === 0}
  <div class="no-servers">No servers found</div>
 {:else}
  <div class="servers-grid">
   {#each guilds as guild (guild.id)}
    {@const iconUrl = getGuildIconUrl(guild)}
    {@const bannerUrl = getGuildBannerUrl(guild)}
    {@const clanBadgeUrl = getClanBadgeUrl(guild)}
    {@const isAdmin = hasAdminPermission(guild.permissions)}
    {@const canManage = hasManageGuildPermission(guild.permissions)}
    {@const boostProgress = getBoostProgress(
     guild.premium_subscription_count || 0
    )}
    <div
     class="server-card"
     style={bannerUrl ? `--banner-url: url(${bannerUrl})` : ""}
    >
     {#if bannerUrl}
      <div class="server-banner"></div>
     {/if}
     <div class="server-content">
      <div class="server-header">
       <div class="server-icon">
        {#if iconUrl}
         <img src={iconUrl} alt={guild.name} class="guild-icon-img" />
        {:else}
         <div class="guild-icon-fallback">
          {getGuildInitials(guild.name)}
         </div>
        {/if}
        {#if clanBadgeUrl}
         <img src={clanBadgeUrl} alt="Clan Badge" class="clan-badge-overlay" />
        {/if}
       </div>
       <div class="server-badges">
        {#if guild.owner}
         <div class="badge owner" data-tooltip="Owner">
          <IconCrown size={16} stroke={2} />
         </div>
        {/if}
        {#if isAdmin}
         <div class="badge admin" data-tooltip="Owner / Co-Owner / Admin">
          <IconShield size={16} stroke={2} />
         </div>
        {/if}
        {#if canManage}
         <div class="badge manage" data-tooltip="Server Manager">
          <IconSettings size={16} stroke={2} />
         </div>
        {/if}
       </div>
      </div>
      <div class="server-info">
       <h3 class="server-name">{guild.name}</h3>

       {#if guild.description}
        <p class="server-description">{guild.description}</p>
       {/if}

       <div class="server-stats">
        <span class="stat" title="Online members">
         <span class="stat-dot online"></span>
         <IconUserCircle size={14} stroke={1.5} />
         {guild.approximate_presence_count.toLocaleString()}
        </span>
        <span class="stat" title="Total members">
         <span class="stat-dot members"></span>
         <IconUsers size={14} stroke={1.5} />
         {guild.approximate_member_count.toLocaleString()}
        </span>
       </div>

       {#if guild.premium_tier && guild.premium_tier > 0}
        <div class="premium-section">
         <div class="premium-tier">
          <IconSparkles size={14} stroke={1.5} />
          <span>{getPremiumTierLabel(guild.premium_tier)}</span>
          <IconStar size={14} stroke={1.5} class="star-icon" />
         </div>
         <div class="boost-info">
          <div class="boost-bar-container">
           <div class="boost-bar-fill" style="width: {boostProgress}%"></div>
          </div>
          <span class="boost-count"
           >{guild.premium_subscription_count || 0} boosts</span
          >
         </div>
        </div>
       {/if}

       {#if guild.vanity_url_code}
        <button
         class="vanity-btn"
         onclick={() => openVanityUrl(guild.vanity_url_code || null)}
        >
         <span>discord.gg/{guild.vanity_url_code}</span>
         <IconExternalLink size={14} stroke={1.5} />
        </button>
       {/if}
      </div>
     </div>
    </div>
   {/each}
  </div>
 {/if}
</div>

<style>
 .servers-window {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(
   135deg,
   rgba(137, 180, 250, 0.05),
   rgba(116, 199, 236, 0.05)
  );
 }

 .servers-title {
  font-size: 24px;
  font-weight: 700;
  color: #89b4fa;
  margin: 0 0 20px 0;
  text-shadow: 0 0 10px rgba(137, 180, 250, 0.5);
 }

 .loading,
 .no-servers {
  text-align: center;
  padding: 40px;
  color: #bac2de;
  font-size: 16px;
 }

 .servers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
 }

 @media (max-width: 768px) {
  .servers-grid {
   grid-template-columns: 1fr;
   gap: 12px;
  }
 }

 .server-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(137, 180, 250, 0.2);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  cursor: pointer;
  position: relative;
 }

 .server-card:hover {
  transform: translateY(-4px);
  border-color: #89b4fa;
  box-shadow: 0 8px 25px rgba(137, 180, 250, 0.3);
  background: rgba(137, 180, 250, 0.05);
 }

 .server-banner {
  width: 100%;
  height: 80px;
  background-image: var(--banner-url);
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 11px 11px 0 0;
  overflow: hidden;
 }

 .server-banner::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.6));
 }

 .server-content {
  padding: 16px;
 }

 .server-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
 }

 .server-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(137, 180, 250, 0.3);
  background: rgba(137, 180, 250, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .guild-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
 }

 .guild-icon-fallback {
  font-size: 24px;
  font-weight: 700;
  color: #89b4fa;
  text-shadow: 0 0 10px rgba(137, 180, 250, 0.5);
 }

 .server-badges {
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

 .badge.owner {
  background: rgba(250, 179, 135, 0.2);
  border-color: rgba(250, 179, 135, 0.4);
  color: #fab387;
 }

 .badge.owner:hover {
  background: rgba(250, 179, 135, 0.3);
  box-shadow: 0 0 10px rgba(250, 179, 135, 0.5);
 }

 .badge.admin {
  background: rgba(243, 139, 168, 0.2);
  border-color: rgba(243, 139, 168, 0.4);
  color: #f38ba8;
 }

 .badge.admin:hover {
  background: rgba(243, 139, 168, 0.3);
  box-shadow: 0 0 10px rgba(243, 139, 168, 0.5);
 }

 .badge.manage {
  background: rgba(137, 180, 250, 0.2);
  border-color: rgba(137, 180, 250, 0.4);
  color: #89b4fa;
 }

 .badge.manage:hover {
  background: rgba(137, 180, 250, 0.3);
  box-shadow: 0 0 10px rgba(137, 180, 250, 0.5);
 }

 .server-info {
  text-align: left;
 }

 .server-name {
  font-size: 16px;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
 }

 .server-description {
  font-size: 12px;
  color: #9399b2;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
 }

 .clan-badge-overlay {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(137, 180, 250, 0.3);
  background: rgba(0, 0, 0, 0.8);
  padding: 2px;
 }

 .server-stats {
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

 .stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
 }

 .stat-dot.online {
  background: #a6e3a1;
  box-shadow: 0 0 8px rgba(166, 227, 161, 0.8);
 }

 .stat-dot.members {
  background: #89b4fa;
  box-shadow: 0 0 8px rgba(137, 180, 250, 0.8);
 }

 .premium-section {
  margin-top: 12px;
  padding: 10px;
  background: rgba(245, 194, 231, 0.1);
  border: 1px solid rgba(245, 194, 231, 0.3);
  border-radius: 8px;
 }

 .premium-tier {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #f5c2e7;
  margin-bottom: 8px;
 }

 .premium-tier .star-icon {
  color: #f9e2af;
 }

 .boost-info {
  display: flex;
  align-items: center;
  gap: 8px;
 }

 .boost-bar-container {
  flex: 1;
  height: 6px;
  background: rgba(137, 180, 250, 0.2);
  border-radius: 3px;
  overflow: hidden;
 }

 .boost-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f5c2e7, #cba6f7);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(245, 194, 231, 0.5);
 }

 .boost-count {
  font-size: 11px;
  color: #bac2de;
  white-space: nowrap;
  min-width: 60px;
  text-align: right;
 }

 .vanity-btn {
  margin-top: 12px;
  width: 100%;
  padding: 8px 12px;
  background: rgba(137, 180, 250, 0.1);
  border: 1px solid rgba(137, 180, 250, 0.3);
  border-radius: 8px;
  color: #89b4fa;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
 }

 .vanity-btn:hover {
  background: rgba(137, 180, 250, 0.2);
  border-color: #89b4fa;
  box-shadow: 0 4px 12px rgba(137, 180, 250, 0.3);
  transform: translateY(-2px);
 }

 .servers-window::-webkit-scrollbar {
  width: 8px;
 }

 .servers-window::-webkit-scrollbar-track {
  background: rgba(137, 180, 250, 0.05);
 }

 .servers-window::-webkit-scrollbar-thumb {
  background: rgba(137, 180, 250, 0.3);
  border-radius: 4px;
 }

 .servers-window::-webkit-scrollbar-thumb:hover {
  background: rgba(137, 180, 250, 0.5);
 }

 /* Mobile */
 @media (max-width: 768px) {
  .servers-window {
   padding: 12px;
  }

  .servers-title {
   font-size: 20px;
   margin-bottom: 16px;
  }

  .server-card {
   border-radius: 8px;
  }

  .server-banner {
   height: 100px;
   border-radius: 7px 7px 0 0;
  }

  .server-content {
   padding: 12px;
  }

  .server-header {
   flex-direction: column;
   align-items: center;
   gap: 12px;
  }

  .server-icon {
   width: 80px;
   height: 80px;
  }

  .server-badges {
   justify-content: center;
  }

  .badge {
   width: 36px;
   height: 36px;
  }

  .server-info {
   text-align: center;
  }

  .server-name {
   font-size: 18px;
   white-space: normal;
   text-align: center;
  }

  .server-stats {
   justify-content: center;
   gap: 16px;
  }

  .stat {
   font-size: 14px;
  }

  .badge[data-tooltip]::after {
   font-size: 13px;
   padding: 8px 12px;
  }
 }
</style>
