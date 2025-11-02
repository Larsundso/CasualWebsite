import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	},
	compilerOptions: {
		runes: true
	},
	vitePlugin: {
		dynamicCompileOptions({ filename }) {
			if (filename.includes('node_modules/@tabler/icons-svelte')) {
				return { runes: undefined };
			}
		}
	}
};

export default config;
