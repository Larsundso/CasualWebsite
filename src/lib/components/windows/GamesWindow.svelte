<svelte:options runes={true} />

<script lang="ts">
	import { userStore } from "$lib/stores/userStore.svelte";
	import { GameDataType, GameTags, type SupplementalGame } from "$lib/types/discord";
	import IconArrowLeft from "@tabler/icons-svelte/icons/arrow-left";
	import IconBrandSteam from "@tabler/icons-svelte/icons/brand-steam";
	import IconCalendar from "@tabler/icons-svelte/icons/calendar";
	import IconUsers from "@tabler/icons-svelte/icons/users";
	import IconDeviceGamepad2 from "@tabler/icons-svelte/icons/device-gamepad-2";
	import IconExternalLink from "@tabler/icons-svelte/icons/external-link";
	import IconStar from "@tabler/icons-svelte/icons/star";
	import IconStarFilled from "@tabler/icons-svelte/icons/star-filled";
	import IconBrandYoutube from "@tabler/icons-svelte/icons/brand-youtube";
	import IconWorld from "@tabler/icons-svelte/icons/world";
	import IconBrandReddit from "@tabler/icons-svelte/icons/brand-reddit";
	import IconBrandDiscord from "@tabler/icons-svelte/icons/brand-discord";
	import IconPhoto from "@tabler/icons-svelte/icons/photo";
	import IconMovie from "@tabler/icons-svelte/icons/movie";
	import { slide, fade } from "svelte/transition";

	const userData = $derived(userStore.data);

	let currentView = $state<"list" | "detail">("list");
	let selectedGame = $state<SupplementalGame | null>(null);
	let activeTab = $state<"about" | "media" | "links">("about");

	function selectGame(game: SupplementalGame) {
		selectedGame = game;
		currentView = "detail";
		activeTab = "about";
	}

	function backToList() {
		currentView = "list";
		selectedGame = null;
	}

	function formatDate(timestamp: number) {
		return new Date(timestamp * 1000).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	}

	// Get IGDB image URL with size
	function getIGDBImageUrl(
		imageId: string,
		size: "t_thumb" | "t_cover_big" | "t_screenshot_big" | "t_720p" | "t_1080p" = "t_cover_big"
	): string {
		return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
	}

	// Get best cover image (IGDB preferred, Discord fallback)
	function getGameCoverUrl(game: SupplementalGame): string {
		if (game.igdb?.cover?.image_id) {
			return getIGDBImageUrl(game.igdb.cover.image_id, "t_cover_big");
		}
		if (game.cover_image) {
			return `https://cdn.discordapp.com/app-assets/${game.id}/${game.cover_image}.webp?size=512`;
		}
		if (game.icon) {
			return `https://cdn.discordapp.com/app-icons/${game.id}/${game.icon}.webp?size=512`;
		}
		return "https://via.placeholder.com/264x374?text=No+Image";
	}

	// Get developers from IGDB data
	function getDevelopers(game: SupplementalGame): string[] {
		return (
			game.igdb?.involved_companies
				?.filter((ic) => ic.developer)
				.map((ic) => ic.company.name) ?? []
		);
	}

	// Get publishers from IGDB data
	function getPublishers(game: SupplementalGame): string[] {
		return (
			game.igdb?.involved_companies
				?.filter((ic) => ic.publisher)
				.map((ic) => ic.company.name) ?? []
		);
	}

	// Detect website type from URL
	function detectWebsiteType(url: string): { name: string; icon: string; category: number } {
		const urlLower = url.toLowerCase();

		if (urlLower.includes("store.steampowered.com") || urlLower.includes("steamcommunity.com")) {
			return { name: "Steam", icon: "steam", category: 13 };
		}
		if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
			return { name: "YouTube", icon: "youtube", category: 9 };
		}
		if (urlLower.includes("reddit.com")) {
			return { name: "Reddit", icon: "reddit", category: 14 };
		}
		if (urlLower.includes("discord.gg") || urlLower.includes("discord.com")) {
			return { name: "Discord", icon: "discord", category: 18 };
		}
		if (urlLower.includes("twitch.tv")) {
			return { name: "Twitch", icon: "world", category: 6 };
		}
		if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
			return { name: "Twitter/X", icon: "world", category: 5 };
		}
		if (urlLower.includes("facebook.com")) {
			return { name: "Facebook", icon: "world", category: 4 };
		}
		if (urlLower.includes("instagram.com")) {
			return { name: "Instagram", icon: "world", category: 8 };
		}
		if (urlLower.includes("wikipedia.org")) {
			return { name: "Wikipedia", icon: "world", category: 3 };
		}
		if (urlLower.includes("fandom.com") || urlLower.includes("wikia.com")) {
			return { name: "Wiki", icon: "world", category: 2 };
		}
		if (urlLower.includes("epicgames.com") || urlLower.includes("store.epicgames.com")) {
			return { name: "Epic Games", icon: "world", category: 16 };
		}
		if (urlLower.includes("gog.com")) {
			return { name: "GOG", icon: "world", category: 17 };
		}
		if (urlLower.includes("itch.io")) {
			return { name: "Itch.io", icon: "world", category: 15 };
		}
		if (urlLower.includes("playstation.com") || urlLower.includes("store.playstation.com")) {
			return { name: "PlayStation", icon: "world", category: 10 };
		}
		if (urlLower.includes("xbox.com") || urlLower.includes("microsoft.com/store")) {
			return { name: "Xbox", icon: "world", category: 11 };
		}
		if (urlLower.includes("nintendo.com")) {
			return { name: "Nintendo", icon: "world", category: 12 };
		}
		if (urlLower.includes("meta.com") || urlLower.includes("oculus.com")) {
			return { name: "Meta/Oculus", icon: "world", category: 19 };
		}
		if (urlLower.includes("apple.com/app") || urlLower.includes("itunes.apple.com")) {
			return { name: "App Store", icon: "world", category: 10 };
		}
		if (urlLower.includes("play.google.com")) {
			return { name: "Google Play", icon: "world", category: 12 };
		}
		// Fallback: try to get domain name
		try {
			const domain = new URL(url).hostname.replace("www.", "");
			return { name: domain, icon: "world", category: 1 };
		} catch {
			return { name: "Website", icon: "world", category: 1 };
		}
	}

	function getSteamUrl(game: SupplementalGame): string | null {
		// Check IGDB websites by URL pattern (since category may be missing)
		const steamSite = game.igdb?.websites?.find(
			(w) =>
				w.url.includes("store.steampowered.com") || w.url.includes("steamcommunity.com")
		);
		if (steamSite) return steamSite.url;
		const steamSku = game.third_party_skus?.find((s) => s.distributor === "steam");
		if (steamSku) return `https://store.steampowered.com/app/${steamSku.sku}`;
		return null;
	}

	// Format rating as stars
	function getRatingStars(rating: number): number {
		return Math.round(rating / 20); // Convert 0-100 to 0-5 stars
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

			{#if userData.games && Array.isArray(userData.games)}
				{#each userData.user.widgets as widget (widget.data.type)}
					{@const widgetGames = widget.data.games
						.map((g) => ({
							...g,
							details: userData.games.find((sg) => sg.id === g.game_id)
						}))
						.filter((g) => g.details)}

					{#if widgetGames.length > 0}
						<div class="game-category" transition:slide>
							<h3 class="category-title">
								{GameDataType[widget.data.type as never]}
							</h3>
							<div class="games-grid">
								{#each widgetGames as game (game.game_id)}
									{#if game.details}
										<button class="game-card" onclick={() => selectGame(game.details!)}>
											<div class="game-cover">
												<img
													src={getGameCoverUrl(game.details)}
													alt={game.details.name}
													class="cover-image"
													loading="lazy"
												/>
												{#if game.details.igdb?.total_rating}
													<div class="rating-badge">
														<IconStarFilled size={12} />
														{Math.round(game.details.igdb.total_rating)}
													</div>
												{/if}
											</div>
											<div class="game-info">
												<strong class="game-title">{game.details.name}</strong>
												{#if game.details.igdb?.genres?.length}
													<p class="game-genres">
														{game.details.igdb.genres
															.slice(0, 2)
															.map((g) => g.name)
															.join(", ")}
													</p>
												{/if}
												{#if game.comment}
													<p class="game-comment">"{game.comment}"</p>
												{/if}
												{#if game.tags.length > 0}
													<div class="game-tags">
														{#each game.tags.slice(0, 2) as tag (tag)}
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
					<div class="detail-cover">
						<img
							src={getGameCoverUrl(selectedGame)}
							alt={selectedGame.name}
							class="cover-image"
							loading="lazy"
						/>
					</div>
					<div class="detail-header-info">
						<h1 class="detail-title">{selectedGame.name}</h1>

						<!-- Rating -->
						{#if selectedGame.igdb?.total_rating}
							<div class="rating-display">
								<div class="stars">
									{#each Array(5) as _, i}
										{#if i < getRatingStars(selectedGame.igdb.total_rating)}
											<IconStarFilled size={20} class="star-filled" />
										{:else}
											<IconStar size={20} class="star-empty" />
										{/if}
									{/each}
								</div>
								<span class="rating-text">
									{Math.round(selectedGame.igdb.total_rating)}/100
									{#if selectedGame.igdb.rating_count}
										<span class="rating-count">
											({selectedGame.igdb.rating_count} ratings)
										</span>
									{/if}
								</span>
							</div>
						{/if}

						<!-- Quick Info -->
						<div class="quick-info">
							{#if selectedGame.igdb?.first_release_date}
								<div class="info-chip">
									<IconCalendar size={16} />
									{formatDate(selectedGame.igdb.first_release_date)}
								</div>
							{/if}
							{#if selectedGame.igdb?.game_modes?.length}
								<div class="info-chip">
									<IconUsers size={16} />
									{selectedGame.igdb.game_modes.map((m) => m.name).join(", ")}
								</div>
							{/if}
						</div>

						<!-- Genres -->
						{#if selectedGame.igdb?.genres?.length}
							<div class="genre-pills">
								{#each selectedGame.igdb.genres as genre (genre.id)}
									<span class="genre-pill">{genre.name}</span>
								{/each}
							</div>
						{/if}

						<!-- Platforms -->
						{#if selectedGame.igdb?.platforms?.length}
							<div class="platform-pills">
								{#each selectedGame.igdb.platforms as platform (platform.id)}
									<span class="platform-pill">
										{platform.abbreviation || platform.name}
									</span>
								{/each}
							</div>
						{/if}

						<!-- Action Buttons -->
						<div class="action-buttons">
							{#if getSteamUrl(selectedGame)}
								<a href={getSteamUrl(selectedGame)} target="_blank" rel="noopener noreferrer" class="steam-button">
									<IconBrandSteam size={20} />
									View on Steam
								</a>
							{/if}
							{#if selectedGame.igdb?.url}
								<a
									href={selectedGame.igdb.url}
									target="_blank"
									rel="noopener noreferrer"
									class="igdb-button"
								>
									<IconWorld size={20} />
									IGDB Page
								</a>
							{/if}
						</div>
					</div>
				</div>

				<!-- Tabs -->
				<div class="tabs">
					<button
						class="tab"
						class:active={activeTab === "about"}
						onclick={() => (activeTab = "about")}
					>
						About
					</button>
					{#if selectedGame.igdb?.screenshots?.length || selectedGame.igdb?.artworks?.length || selectedGame.igdb?.videos?.length}
						<button
							class="tab"
							class:active={activeTab === "media"}
							onclick={() => (activeTab = "media")}
						>
							<IconPhoto size={16} />
							Media
						</button>
					{/if}
					{#if selectedGame.igdb?.websites?.length}
						<button
							class="tab"
							class:active={activeTab === "links"}
							onclick={() => (activeTab = "links")}
						>
							<IconExternalLink size={16} />
							Links
						</button>
					{/if}
				</div>

				<!-- Tab Content -->
				<div class="tab-content">
					{#if activeTab === "about"}
						<!-- Summary -->
						{#if selectedGame.igdb?.summary}
							<div class="content-section">
								<h3>Summary</h3>
								<p class="summary-text">{selectedGame.igdb.summary}</p>
							</div>
						{/if}

						<!-- Storyline -->
						{#if selectedGame.igdb?.storyline}
							<div class="content-section">
								<h3>Storyline</h3>
								<p class="storyline-text">{selectedGame.igdb.storyline}</p>
							</div>
						{/if}

						<!-- Developers & Publishers -->
						{@const developers = getDevelopers(selectedGame)}
						{@const publishers = getPublishers(selectedGame)}
						{#if developers.length > 0 || publishers.length > 0}
							<div class="content-section companies-section">
								{#if developers.length > 0}
									<div class="company-group">
										<h4>Developer{developers.length > 1 ? "s" : ""}</h4>
										<p>{developers.join(", ")}</p>
									</div>
								{/if}
								{#if publishers.length > 0}
									<div class="company-group">
										<h4>Publisher{publishers.length > 1 ? "s" : ""}</h4>
										<p>{publishers.join(", ")}</p>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Themes -->
						{#if selectedGame.igdb?.themes?.length}
							<div class="content-section">
								<h3>Themes</h3>
								<div class="theme-pills">
									{#each selectedGame.igdb.themes as theme (theme.id)}
										<span class="theme-pill">{theme.name}</span>
									{/each}
								</div>
							</div>
						{/if}
					{:else if activeTab === "media"}
						<!-- Videos -->
						{#if selectedGame.igdb?.videos?.length}
							<div class="content-section">
								<h3>
									<IconMovie size={20} />
									Videos
								</h3>
								<div class="videos-grid">
									{#each selectedGame.igdb.videos as video (video.video_id)}
										<div class="video-card">
											<iframe
												src="https://www.youtube.com/embed/{video.video_id}"
												title={video.name}
												frameborder="0"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowfullscreen
												class="video-iframe"
											></iframe>
											<span class="video-title">{video.name}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Screenshots -->
						{#if selectedGame.igdb?.screenshots?.length}
							<div class="content-section">
								<h3>
									<IconPhoto size={20} />
									Screenshots
								</h3>
								<div class="screenshots-grid">
									{#each selectedGame.igdb.screenshots as screenshot (screenshot.image_id)}
										<a
											href={getIGDBImageUrl(screenshot.image_id, "t_1080p")}
											target="_blank"
											rel="noopener noreferrer"
											class="screenshot"
										>
											<img
												src={getIGDBImageUrl(screenshot.image_id, "t_screenshot_big")}
												alt="Screenshot"
												class="media-image"
												loading="lazy"
											/>
										</a>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Artworks -->
						{#if selectedGame.igdb?.artworks?.length}
							<div class="content-section">
								<h3>Artwork</h3>
								<div class="artwork-grid">
									{#each selectedGame.igdb.artworks as artwork (artwork.image_id)}
										<a
											href={getIGDBImageUrl(artwork.image_id, "t_1080p")}
											target="_blank"
											rel="noopener noreferrer"
											class="artwork"
										>
											<img
												src={getIGDBImageUrl(artwork.image_id, "t_720p")}
												alt="Artwork"
												class="media-image"
												loading="lazy"
											/>
										</a>
									{/each}
								</div>
							</div>
						{/if}
					{:else if activeTab === "links"}
						<div class="content-section">
							<h3>External Links</h3>
							<div class="links-grid">
								{#each selectedGame.igdb?.websites ?? [] as website (website.url)}
									{@const siteInfo = detectWebsiteType(website.url)}
									<a
										href={website.url}
										target="_blank"
										rel="noopener noreferrer"
										class="link-card"
									>
										{#if siteInfo.category === 13}
											<IconBrandSteam size={24} />
										{:else if siteInfo.category === 14}
											<IconBrandReddit size={24} />
										{:else if siteInfo.category === 9}
											<IconBrandYoutube size={24} />
										{:else if siteInfo.category === 18}
											<IconBrandDiscord size={24} />
										{:else}
											<IconWorld size={24} />
										{/if}
										<span class="link-name">{siteInfo.name}</span>
										<IconExternalLink size={14} class="link-external" />
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.games-window {
		width: 100%;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		background: linear-gradient(135deg, rgba(137, 180, 250, 0.05), rgba(203, 166, 247, 0.05));
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
		padding-left: 12px;
		border-left: 4px solid #cba6f7;
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
		position: relative;
		width: 100%;
		height: 240px;
		overflow: hidden;
		background-color: rgba(137, 180, 250, 0.1);
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.rating-badge {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 6px;
		font-size: 12px;
		font-weight: 700;
		color: #f9e2af;
	}

	.game-info {
		padding: 12px;
	}

	.game-title {
		display: block;
		font-size: 14px;
		font-weight: 700;
		color: #cdd6f4;
		margin-bottom: 4px;
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.game-genres {
		font-size: 11px;
		color: #89b4fa;
		margin: 0 0 6px 0;
		opacity: 0.8;
	}

	.game-comment {
		font-style: italic;
		color: #a6adc8;
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
		margin-bottom: 24px;
	}

	.detail-cover {
		flex-shrink: 0;
		width: 264px;
		height: 374px;
		overflow: hidden;
		background-color: rgba(137, 180, 250, 0.1);
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	.detail-cover .cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.detail-header-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.detail-title {
		font-size: 32px;
		font-weight: 700;
		color: #cdd6f4;
		margin: 0;
		line-height: 1.2;
	}

	/* Rating Display */
	.rating-display {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.stars {
		display: flex;
		gap: 2px;
	}

	.stars :global(.star-filled) {
		color: #f9e2af;
	}

	.stars :global(.star-empty) {
		color: #585b70;
	}

	.rating-text {
		font-size: 14px;
		color: #cdd6f4;
		font-weight: 600;
	}

	.rating-count {
		font-weight: 400;
		color: #a6adc8;
	}

	/* Quick Info */
	.quick-info {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.info-chip {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: rgba(137, 180, 250, 0.1);
		border-radius: 20px;
		font-size: 12px;
		color: #a6adc8;
	}

	/* Genre Pills */
	.genre-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.genre-pill {
		padding: 6px 14px;
		background: linear-gradient(135deg, rgba(137, 180, 250, 0.2), rgba(137, 180, 250, 0.1));
		border: 1px solid rgba(137, 180, 250, 0.3);
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		color: #89b4fa;
	}

	/* Platform Pills */
	.platform-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.platform-pill {
		padding: 4px 10px;
		background: rgba(166, 227, 161, 0.15);
		border: 1px solid rgba(166, 227, 161, 0.3);
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		color: #a6e3a1;
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 8px;
	}

	.steam-button,
	.igdb-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s;
	}

	.steam-button {
		background: linear-gradient(135deg, #1b2838, #2a475e);
		border: 1px solid rgba(102, 192, 244, 0.3);
		color: #66c0f4;
	}

	.steam-button:hover {
		border-color: #66c0f4;
		box-shadow: 0 4px 16px rgba(102, 192, 244, 0.3);
		transform: translateY(-2px);
	}

	.igdb-button {
		background: rgba(137, 180, 250, 0.1);
		border: 1px solid rgba(137, 180, 250, 0.3);
		color: #89b4fa;
	}

	.igdb-button:hover {
		background: rgba(137, 180, 250, 0.2);
		border-color: #89b4fa;
	}

	/* Tabs */
	.tabs {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 12px;
		margin-bottom: 20px;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		background: transparent;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #a6adc8;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		background: rgba(137, 180, 250, 0.1);
		color: #cdd6f4;
	}

	.tab.active {
		background: rgba(137, 180, 250, 0.2);
		color: #89b4fa;
	}

	/* Tab Content */
	.tab-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.content-section {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 12px;
		padding: 20px;
		border: 1px solid rgba(137, 180, 250, 0.1);
	}

	.content-section h3 {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 18px;
		font-weight: 700;
		color: #cba6f7;
		margin: 0 0 16px 0;
	}

	.content-section h4 {
		font-size: 12px;
		font-weight: 600;
		color: #89b4fa;
		margin: 0 0 6px 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.summary-text,
	.storyline-text {
		color: #cdd6f4;
		font-size: 14px;
		line-height: 1.7;
		margin: 0;
		white-space: pre-wrap;
	}

	.companies-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
	}

	.company-group p {
		color: #cdd6f4;
		font-size: 14px;
		margin: 0;
	}

	/* Theme Pills */
	.theme-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.theme-pill {
		padding: 6px 12px;
		background: rgba(203, 166, 247, 0.15);
		border: 1px solid rgba(203, 166, 247, 0.3);
		border-radius: 16px;
		font-size: 12px;
		color: #cba6f7;
	}

	/* Videos Grid */
	.videos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 16px;
	}

	.video-card {
		position: relative;
		display: flex;
		flex-direction: column;
		border-radius: 12px;
		overflow: hidden;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(137, 180, 250, 0.2);
	}

	.video-iframe {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: none;
	}

	.video-title {
		padding: 12px;
		color: #cdd6f4;
		font-size: 13px;
		font-weight: 600;
		background: rgba(0, 0, 0, 0.6);
	}

	/* Screenshots Grid */
	.screenshots-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 12px;
	}

	.screenshot {
		display: block;
		width: 100%;
		height: 180px;
		overflow: hidden;
		border-radius: 8px;
		border: 1px solid rgba(137, 180, 250, 0.2);
		transition: all 0.3s;
	}

	.screenshot:hover {
		transform: scale(1.02);
		border-color: rgba(137, 180, 250, 0.5);
		box-shadow: 0 8px 24px rgba(137, 180, 250, 0.2);
	}

	/* Artwork Grid */
	.artwork-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 12px;
	}

	.artwork {
		display: block;
		width: 100%;
		height: 200px;
		overflow: hidden;
		border-radius: 8px;
		border: 1px solid rgba(203, 166, 247, 0.2);
		transition: all 0.3s;
	}

	.artwork:hover {
		transform: scale(1.02);
		border-color: rgba(203, 166, 247, 0.5);
		box-shadow: 0 8px 24px rgba(203, 166, 247, 0.2);
	}

	.media-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	/* Links Grid */
	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 12px;
	}

	.link-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: rgba(137, 180, 250, 0.1);
		border: 1px solid rgba(137, 180, 250, 0.2);
		border-radius: 10px;
		text-decoration: none;
		color: #89b4fa;
		transition: all 0.2s;
	}

	.link-card:hover {
		background: rgba(137, 180, 250, 0.2);
		border-color: rgba(137, 180, 250, 0.4);
		transform: translateY(-2px);
	}

	.link-name {
		flex: 1;
		font-size: 13px;
		font-weight: 600;
		color: #cdd6f4;
	}

	.link-card :global(.link-external) {
		opacity: 0.5;
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

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.games-list-view {
			padding: 12px;
		}

		.main-title {
			font-size: 22px;
			margin-bottom: 20px;
		}

		.games-grid {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
			gap: 12px;
		}

		.game-cover {
			height: 200px;
		}

		.detail-content {
			padding: 16px;
		}

		.detail-header {
			flex-direction: column;
			align-items: center;
			gap: 16px;
		}

		.detail-cover {
			width: 100%;
			max-width: 200px;
			height: auto;
			aspect-ratio: 264 / 374;
		}

		.detail-header-info {
			width: 100%;
			align-items: center;
			text-align: center;
		}

		.detail-title {
			font-size: 24px;
		}

		.quick-info,
		.genre-pills,
		.platform-pills,
		.action-buttons {
			justify-content: center;
		}

		.tabs {
			flex-wrap: wrap;
		}

		.tab {
			padding: 8px 14px;
			font-size: 13px;
		}

		.videos-grid,
		.screenshots-grid,
		.artwork-grid {
			grid-template-columns: 1fr;
		}

		.links-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
