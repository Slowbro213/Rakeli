import { readdir, writeFile, stat } from 'fs/promises';
import { join, resolve } from 'path';

const COMMANDS_DIR = resolve('src/ts/commands');
const REGISTRY_FILE = join(COMMANDS_DIR, 'registry.ts');

async function findCommands(): Promise<{ name: string; path: string }[]> {
	const entries = await readdir(COMMANDS_DIR, { withFileTypes: true });
	const commands: { name: string; path: string }[] = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;

		const folderPath = join(COMMANDS_DIR, entry.name);
		const possiblePath = join(folderPath, `${entry.name}.ts`);

		try {
			const fileStat = await stat(possiblePath);
			if (fileStat.isFile()) {
				commands.push({
					name: entry.name,
					path: `./${entry.name}`,
				});
			}
		} catch {}
	}

	return commands;
}

async function generateRegistry() {
	const commands = await findCommands();

	const imports = commands
		.map(({ name, path }) => `import { ${name} } from "${path}";`)
		.join('\n');

	const commandList = `export const commands: Command[] = [${commands
		.map((c) => c.name)
		.join(', ')}];`;

	const content = `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY

import type { Command } from "./types";
${imports}

${commandList}
`;

	await writeFile(REGISTRY_FILE, content, 'utf-8');
	console.log(`✅ Wrote ${commands.length} commands to registry.ts`);
}

generateRegistry().catch((err) => {
	console.error('❌ Failed to generate command registry:', err);
});
