import { readdir, writeFile } from 'fs/promises';
import { resolve } from 'path';

const TRACKS_DIR = resolve('public/assets/storage/mp3');
const REGISTRY_FILE = resolve('src/ts/musicplayer/registry.ts');

async function findTracks(): Promise<string[]> {
	const entries = await readdir(TRACKS_DIR, { withFileTypes: true });

	const tracks = entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.mp3'))
		.map((entry) => entry.name);

	return tracks;
}

async function generateTrackRegistry() {
	const tracks = await findTracks();

	const trackList = `export const tracks = [
${tracks.map((track) => `  "${track}"`).join(',\n')}
];\n`;

	const content = `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY

${trackList}`;

	await writeFile(REGISTRY_FILE, content, 'utf-8');
	console.log(`✅ Wrote ${tracks.length} tracks to registry.ts`);
}

generateTrackRegistry().catch((err) => {
	console.error('❌ Failed to generate track registry:', err);
});
