<script lang="ts">
	import { onMount } from 'svelte';
	import type { GETUser } from '../../../routes/api/user/+server';
	import type { Guild } from '$lib/types/discord';
	import IconCrown from '@tabler/icons-svelte/icons/crown';
	import IconShield from '@tabler/icons-svelte/icons/shield';
	import IconSettings from '@tabler/icons-svelte/icons/settings';
	import IconUsers from '@tabler/icons-svelte/icons/users';
	import IconUserCircle from '@tabler/icons-svelte/icons/user-circle';

	let userData = $state<GETUser | null>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/user');
			userData = await response.json();
		} catch (error) {
			console.error('Failed to fetch user data:', error);
		} finally {
			loading = false;
		}
	});

	const guilds = $derived(userData?.guilds || []);

	function getGuildIconUrl(guild: Guild): string | null {
		if (!guild.icon) return null;
		const extension = guild.icon.startsWith('a_') ? 'gif' : 'webp';
		return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${extension}?size=128`;
	}

	function getGuildBannerUrl(guild: Guild): string | null {
		if (!guild.banner) return null;
		const extension = guild.banner.startsWith('a_') ? 'gif' : 'webp';
		return `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${extension}?size=480`;
	}

	function hasAdminPermission(permissions: string): boolean {
		return (BigInt(permissions) & 8n) === 8n;
	}

	function hasManageGuildPermission(permissions: string): boolean {
		return (BigInt(permissions) & 32n) === 32n;
	}

	function getGuildInitials(name: string): string {
		return name
			.split(' ')
			.map(word => word[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}
</script>

<div class="servers-window">
	<h2 class="servers-title">Discord Servers</h2>
	{#if loading}
		<div class="loading">Loading servers...</div>
	{:else if guilds.length === 0}
		<div class="no-servers">No servers found</div>
	{:else}
		<div class="servers-grid">
			{#each guilds as guild (guild.id)}
				{@const iconUrl = getGuildIconUrl(guild)}
				{@const bannerUrl = getGuildBannerUrl(guild)}
				{@const isAdmin = hasAdminPermission(guild.permissions)}
				{@const canManage = hasManageGuildPermission(guild.permissions)}
				<div class="server-card" style={bannerUrl ? `--banner-url: url(${bannerUrl})` : ''}>
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
		background: linear-gradient(135deg, rgba(137, 180, 250, 0.05), rgba(116, 199, 236, 0.05));
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
		content: '';
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
		content: '';
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
		margin: 0 0 12px 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
</style>
