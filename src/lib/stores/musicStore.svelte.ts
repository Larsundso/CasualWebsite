/**
 * Music Store
 * Manages ambient sounds with Web Audio API, visualizers, and presets
 */

export interface Sound {
 id: number;
 name: string;
 icon: string;
 playing: boolean;
 volume: number;
 audioElement?: HTMLAudioElement;
 audioContext?: AudioContext;
 analyser?: AnalyserNode;
 source?: MediaElementAudioSourceNode;
}

export interface SoundPreset {
 name: string;
 icon: string;
 description: string;
 soundSettings: { id: number; volume: number }[];
}

let masterAudioContext: AudioContext | null = null;
let masterAnalyser = $state<AnalyserNode | null>(null);
let masterGain: GainNode | null = null;

let youtubeUrl = $state(
 "https://www.youtube.com/playlist?list=PLd-7ZLEr1elbCr1vWU-4pittlYonya_-O"
);
let youtubePlayer: any = $state(null);
let youtubePlayerId = "persistent-youtube-player";
let isYoutubePlayerReady = $state(false);
let youtubeVolume = $state(0.5);
let hasSkippedFirstVideo = false;

const soundColors = [
 "#89b4fa", // Rain - Blue
 "#94e2d5", // AC Noise - Teal
 "#f9e2af", // Cafe - Yellow
 "#f38ba8", // City Traffic - Red
 "#cba6f7", // White Noise - Purple
 "#fab387", // Brown Noise - Peach
 "#74c7ec", // Waterfall - Sky Blue
 "#a6e3a1", // Thunderstorm - Green
 "#b4befe", // Hail - Lavender
 "#f38ba8", // Fireplace - Pink
 "#a6e3a1", // Forest - Light Green
 "#eba0ac", // Birds - Mauve
 "#89dceb", // Beach Waves - Cyan
];

let sounds = $state<Sound[]>([
 { id: 1, name: "Rain", icon: "cloud-rain", playing: false, volume: 0.5 },
 {
  id: 2,
  name: "AC Noise",
  icon: "air-conditioning",
  playing: false,
  volume: 0.5,
 },
 { id: 3, name: "Cafe", icon: "coffee", playing: false, volume: 0.5 },
 { id: 4, name: "City Traffic", icon: "car", playing: false, volume: 0.5 },
 { id: 5, name: "White Noise", icon: "radio", playing: false, volume: 0.5 },
 { id: 6, name: "Brown Noise", icon: "volume", playing: false, volume: 0.5 },
 { id: 7, name: "Waterfall", icon: "droplet", playing: false, volume: 0.5 },
 {
  id: 8,
  name: "Thunderstorm",
  icon: "cloud-storm",
  playing: false,
  volume: 0.5,
 },
 { id: 9, name: "Hail", icon: "hexagon-3d", playing: false, volume: 0.5 },
 { id: 10, name: "Fireplace", icon: "flame", playing: false, volume: 0.5 },
 { id: 11, name: "Forest", icon: "tree", playing: false, volume: 0.5 },
 { id: 12, name: "Birds", icon: "feather", playing: false, volume: 0.5 },
 { id: 13, name: "Beach Waves", icon: "beach", playing: false, volume: 0.5 },
]);

/**
 * Get color for a sound by index
 */
export function getSoundColor(index: number): string {
 return soundColors[index] || "#cba6f7";
}

const soundFilePaths: Record<number, string> = {
 1: "/assets/sounds/rain-on-the-window-114709.mp3",
 2: "/assets/sounds/air-conditioner-in-car-83788.mp3",
 3: "/assets/sounds/casual-cafe-restaurant-noise-73945.mp3",
 4: "/assets/sounds/city-traffic-noise2-16695.mp3",
 5: "/assets/sounds/soft-soothing-deep-white-noise-378857.mp3",
 6: "/assets/sounds/brownian-noise_16-bit-441khz_brownsches-rauschen-103991.mp3",
 7: "/assets/sounds/waterfall-sounds-259625.mp3",
 8: "/assets/sounds/thunderstorm-14708.mp3",
 9: "/assets/sounds/strong-hail-falling-against-the-window-116182.mp3",
 10: "/assets/sounds/fire-sound-334130.mp3",
 11: "/assets/sounds/forest-wind-and-birds-6881.mp3",
 12: "/assets/sounds/birds-19624.mp3",
 13: "/assets/sounds/pink-noise-ocean-waves-on-grainy-sand-195103.mp3",
};

export const soundPresets: SoundPreset[] = [
 {
  name: "Rainy Cafe",
  icon: "☕",
  description: "Cozy cafe ambience with rain",
  soundSettings: [
   { id: 1, volume: 0.6 }, // Rain
   { id: 3, volume: 0.4 }, // Cafe
  ],
 },
 {
  name: "Peaceful Forest",
  icon: "🌲",
  description: "Birds chirping in the woods",
  soundSettings: [
   { id: 11, volume: 0.5 }, // Forest
   { id: 12, volume: 0.6 }, // Birds
  ],
 },
 {
  name: "Stormy Night",
  icon: "⛈️",
  description: "Thunder and heavy rain",
  soundSettings: [
   { id: 1, volume: 0.5 }, // Rain
   { id: 8, volume: 0.4 }, // Thunderstorm
   { id: 10, volume: 0.3 }, // Fireplace
  ],
 },
 {
  name: "City Life",
  icon: "🏙️",
  description: "Urban atmosphere",
  soundSettings: [
   { id: 4, volume: 0.5 }, // City Traffic
   { id: 3, volume: 0.3 }, // Cafe
  ],
 },
];

const playlistId = $derived.by(() => {
 if (youtubeUrl.includes("playlist?list=")) {
  return youtubeUrl.split("list=")[1].split("&")[0];
 }
 return "";
});

/**
 * Initialize master audio context for global visualization
 */
function initMasterAudioContext() {
 if (typeof window === "undefined") return;
 if (!masterAudioContext) {
  masterAudioContext = new AudioContext();
  masterAnalyser = masterAudioContext.createAnalyser();
  masterAnalyser.fftSize = 256;
  masterGain = masterAudioContext.createGain();
  masterGain.connect(masterAnalyser);
  masterAnalyser.connect(masterAudioContext.destination);
 }
}

/**
 * Initialize YouTube IFrame API
 */
export function initYouTubePlayer() {
 if (typeof window === "undefined" || !playlistId) return;

 if (youtubePlayer) {
  youtubePlayer.destroy();
  youtubePlayer = null;
  isYoutubePlayerReady = false;
  hasSkippedFirstVideo = false;
 }

 if (!(window as any).YT) {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  (window as any).onYouTubeIframeAPIReady = createPlayer;
 } else {
  createPlayer();
 }
}

/**
 * Create YouTube player instance
 */
function createPlayer() {
 if (!playlistId) return;

 const container = document.getElementById(youtubePlayerId);
 if (!container) {
  console.warn("YouTube player container not found");
  return;
 }

 youtubePlayer = new (window as any).YT.Player(youtubePlayerId, {
  height: "100%",
  width: "100%",
  playerVars: {
   listType: "playlist",
   list: playlistId,
   autoplay: 1,
   enablejsapi: 1,
  },
  events: {
   onReady: onPlayerReady,
   onStateChange: onPlayerStateChange,
  },
 });
}

/**
 * Handle YouTube player state change
 */
function onPlayerStateChange(event: any) {
 if (event.data === 1 && !hasSkippedFirstVideo) {
  hasSkippedFirstVideo = true;

  setTimeout(() => {
   if (youtubePlayer && youtubePlayer.nextVideo) {
    youtubePlayer.nextVideo();
   }
  }, 100);
 }
}

/**
 * Handle YouTube player ready event
 */
function onPlayerReady(event: any) {
 isYoutubePlayerReady = true;

 if (youtubePlayer && youtubePlayer.setVolume) {
  youtubePlayer.setVolume(youtubeVolume * 100);
 }

 setTimeout(() => {
  if (youtubePlayer && youtubePlayer.setShuffle) {
   youtubePlayer.setShuffle(true);
  }
 }, 1000);
}

/**
 * Toggle YouTube playback
 */
export function toggleYoutube() {
 if (!youtubePlayer || !isYoutubePlayerReady) return;

 const state = youtubePlayer.getPlayerState();

 if (state === 1) {
  youtubePlayer.pauseVideo();
 } else {
  youtubePlayer.playVideo();
 }
}

/**
 * Skip to next video in YouTube playlist
 */
export function nextYoutubeVideo() {
 if (!youtubePlayer || !isYoutubePlayerReady) return;
 youtubePlayer.nextVideo();
}

/**
 * Skip to previous video in YouTube playlist
 */
export function previousYoutubeVideo() {
 if (!youtubePlayer || !isYoutubePlayerReady) return;
 youtubePlayer.previousVideo();
}

/**
 * Set YouTube volume
 */
export function setYoutubeVolume(volume: number) {
 youtubeVolume = volume;
 if (youtubePlayer && youtubePlayer.setVolume) {
  youtubePlayer.setVolume(volume * 100);
 }
}

/**
 * Check if YouTube is playing
 */
export function isYoutubePlaying(): boolean {
 if (!youtubePlayer || !isYoutubePlayerReady) return false;
 return youtubePlayer.getPlayerState() === 1;
}

/**
 * Update YouTube URL and reload player
 */
export function setYoutubeUrl(url: string) {
 youtubeUrl = url;
 initYouTubePlayer();
}

/**
 * Toggle ambient sound playback
 */
export function toggleSound(index: number) {
 const sound = sounds[index];
 if (!sound) return;

 initMasterAudioContext();

 if (!sound.audioElement) {
  const audioPath = soundFilePaths[sound.id];
  if (audioPath) {
   sound.audioElement = new Audio(audioPath);
   sound.audioElement.loop = true;
   sound.audioElement.volume = sound.volume;
   sound.audioElement.crossOrigin = "anonymous";

   if (masterAudioContext && masterGain) {
    sound.audioContext = masterAudioContext;
    sound.source = masterAudioContext.createMediaElementSource(
     sound.audioElement
    );
    sound.analyser = masterAudioContext.createAnalyser();
    sound.analyser.fftSize = 256;

    const gain = masterAudioContext.createGain();
    sound.source.connect(sound.analyser);
    sound.analyser.connect(gain);
    gain.connect(masterGain);
   }
  }
 }

 sound.playing = !sound.playing;

 if (sound.audioElement) {
  if (sound.playing) {
   sound.audioElement.play().catch((err) => {
    console.error("Error playing sound:", err);
    sound.playing = false;
   });
  } else {
   sound.audioElement.pause();
  }
 }
}

/**
 * Update ambient sound volume
 */
export function setSoundVolume(index: number, volume: number) {
 const sound = sounds[index];
 if (!sound) return;

 sound.volume = volume;

 if (sound.audioElement) {
  sound.audioElement.volume = volume;
 }
}

/**
 * Apply a sound preset
 */
export function applyPreset(preset: SoundPreset) {
 sounds.forEach((sound, index) => {
  if (sound.playing) {
   toggleSound(index);
  }
 });

 preset.soundSettings.forEach((setting) => {
  const index = sounds.findIndex((s) => s.id === setting.id);
  if (index !== -1) {
   setSoundVolume(index, setting.volume);

   setTimeout(() => {
    if (!sounds[index].playing) {
     toggleSound(index);
    }
   }, 100 * setting.id);
  }
 });
}

/**
 * Stop all sounds
 */
export function stopAllSounds() {
 sounds.forEach((sound, index) => {
  if (sound.playing) {
   toggleSound(index);
  }
 });

 if (youtubePlayer && isYoutubePlaying()) {
  toggleYoutube();
 }
}

/**
 * Get analyser data for visualization
 */
export function getAnalyserData(index: number): Uint8Array | null {
 const sound = sounds[index];
 if (!sound || !sound.analyser) return null;

 const bufferLength = sound.analyser.frequencyBinCount;
 const dataArray = new Uint8Array(bufferLength);
 sound.analyser.getByteFrequencyData(dataArray);
 return dataArray;
}

/**
 * Get master analyser for global visualization
 */
export function getMasterAnalyser(): AnalyserNode | null {
 return masterAnalyser;
}

/**
 * Cleanup function for when the app unmounts
 */
export function cleanupMusicStore() {
 if (youtubePlayer) {
  youtubePlayer.destroy();
  youtubePlayer = null;
 }

 sounds.forEach((sound) => {
  if (sound.audioElement) {
   sound.audioElement.pause();
   sound.audioElement = undefined;
  }
 });

 if (masterAudioContext) {
  masterAudioContext.close();
  masterAudioContext = null;
  masterAnalyser = null;
  masterGain = null;
 }
}

const playingSoundsWithAnalysers = $derived.by(() => {
 return sounds
  .map((sound, index) => ({
   sound,
   index,
   analyser: sound.analyser,
   color: soundColors[index],
   playing: sound.playing,
  }))
  .filter((item) => item.playing && item.analyser);
});

export const musicState = {
 get youtubeUrl() {
  return youtubeUrl;
 },
 get youtubePlayerId() {
  return youtubePlayerId;
 },
 get playlistId() {
  return playlistId;
 },
 get isPlayerReady() {
  return isYoutubePlayerReady;
 },
 get youtubeVolume() {
  return youtubeVolume;
 },
 get sounds() {
  return sounds;
 },
 get masterAnalyser() {
  return masterAnalyser;
 },
 get playingSoundsWithAnalysers() {
  return playingSoundsWithAnalysers;
 },
 set youtubeUrl(url: string) {
  youtubeUrl = url;
 },
};
