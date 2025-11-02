<script lang="ts">
	import { servers } from '$lib/data/serversData';
	import IconRobot from '@tabler/icons-svelte/icons/robot';
	import IconFlag from '@tabler/icons-svelte/icons/flag';
	import IconSparkles from '@tabler/icons-svelte/icons/sparkles';
	import IconDeviceGamepad from '@tabler/icons-svelte/icons/device-gamepad';
	import IconTarget from '@tabler/icons-svelte/icons/target';
	import IconCoffee from '@tabler/icons-svelte/icons/coffee';
	import IconMoon from '@tabler/icons-svelte/icons/moon';
	import IconFlagHeart from '@tabler/icons-svelte/icons/flag-heart';
	import type { ComponentType } from 'svelte';

	const iconMap: Record<string, ComponentType> = {
		robot: IconRobot,
		flag: IconFlag,
		sparkles: IconSparkles,
		'device-gamepad': IconDeviceGamepad,
		target: IconTarget,
		coffee: IconCoffee,
		moon: IconMoon,
		'flag-heart': IconFlagHeart
	};

	function getServerIcon(iconName: string): ComponentType {
		return iconMap[iconName] || IconFlag;
	}
</script>

<div class="servers-window">
	<h2 class="servers-title">Discord Servers</h2>
	<div class="servers-grid">
		{#each servers as server (server.id)}
			{@const Icon = getServerIcon(server.icon)}
			<div class="server-card">
				<div class="server-icon">
					<Icon size={48} stroke={1.5} />
				</div>
				<div class="server-info">
					<h3 class="server-name">{server.name}</h3>
					<div class="server-stats">
						<span class="stat">
							<span class="stat-dot online"></span>
							{server.online} online
						</span>
						<span class="stat">
							<span class="stat-dot members"></span>
							{server.members} members
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.servers-window {
		width: 100%;
		height: 100%;
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

	.servers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 16px;
	}

	.server-card {
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(137, 180, 250, 0.2);
		border-radius: 12px;
		padding: 16px;
		transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
		cursor: pointer;
	}

	.server-card:hover {
		transform: translateY(-4px);
		border-color: #89b4fa;
		box-shadow: 0 8px 25px rgba(137, 180, 250, 0.3);
		background: rgba(137, 180, 250, 0.1);
	}

	.server-icon {
		font-size: 48px;
		text-align: center;
		margin-bottom: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #89b4fa;
	}

	.server-info {
		text-align: center;
	}

	.server-name {
		font-size: 16px;
		font-weight: 700;
		color: #cdd6f4;
		margin: 0 0 12px 0;
	}

	.server-stats {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.stat {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 13px;
		color: #bac2de;
	}

	.stat-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
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
