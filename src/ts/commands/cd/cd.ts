import type { Command } from '../types';
import { stdout } from '@rakeli/stdout';

const routes: Record<string, string> = {
	home: 'index.html',
	index: 'index.html',
	about: 'about.html',
	writeups: 'writeups.html',
	blogs: 'blogs.html',
};

export const cd: Command = {
	name: 'cd',
	exec: (args: string[]) => {
		const target = args[1]?.toLowerCase();
		if (!target) {
			stdout(['usage: cd <page>', 'pages: ' + Object.keys(routes).join(', ')]);
			return 1;
		}
		const route = routes[target];
		if (!route) {
			stdout([`cd: ${target}: no such page`, 'try: ' + Object.keys(routes).join(', ')]);
			return 1;
		}
		window.location.href = route;
		return 0;
	},
};
