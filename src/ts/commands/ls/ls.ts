import { stdout } from '@rakeli/stdout';
import type { Command } from '../types';

export const ls: Command = {
	name: 'ls',
	exec: () => {
		const pages: string[] = [
			'drwxr-xr-x  home         →  index.html',
			'drwxr-xr-x  about        →  about.html',
			'drwxr-xr-x  writeups     →  writeups.html',
			'drwxr-xr-x  blogs        →  blogs.html',
		];

		stdout(pages);
		return 0;
	},
};
