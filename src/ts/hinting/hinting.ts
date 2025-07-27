import { commands } from '@rakeli/commands';
import type { Command } from '@rakeli/commands/types';

type TrieNode = {
	children: Map<string, TrieNode>;
	command?: Command;
};

// Create the root of the trie
export const buildCommandTrie = (commands: Command[]): TrieNode => {
	console.log('Building Commands...');
	const root: TrieNode = { children: new Map() };

	for (const command of commands) {
		let node = root;

		for (const char of command.name) {
			if (!node.children.has(char)) {
				node.children.set(char, { children: new Map() });
			}
			node = node.children.get(char)!;
		}

		// Store the command at the end of the word
		node.command = command;
	}

	return root;
};

export const autocompleteCommand = (prefix: string): Command[] => {
	if (!prefix || root === null) return [];

	let node = root;

	// Step 1: Traverse the trie to the end of the prefix
	for (const char of prefix) {
		const next = node.children.get(char);
		if (!next) return [];
		node = next;
	}

	// Step 2: Find first matching command in subtree
	function dfs(current: TrieNode): Command | undefined {
		if (current.command && current.command.name.startsWith(prefix)) {
			return current.command;
		}

		for (const child of current.children.values()) {
			const found = dfs(child);
			if (found) return found;
		}

		return undefined;
	}

	const match = dfs(node);
	return match ? [match] : [];
};

export const findCommand = (name: string): Command | undefined => {
	if (!name || root === null) return undefined;

	let node = root;

	for (const char of name) {
		const next = node.children.get(char);
		if (!next) return undefined;
		node = next;
	}

	// Match only if this node has a full command with exact name
	return node.command?.name === name ? node.command : undefined;
};

const root = buildCommandTrie(commands);
