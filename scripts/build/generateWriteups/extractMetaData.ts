import fs from 'fs';
import path from 'path';
import { inputDir, jsonWriteupsOutput, jsonTagsOutput } from './config';

function parseFrontmatter(md: string): { frontmatter: Record<string, string>; body: string } {
	if (!md.startsWith('---')) return { frontmatter: {}, body: md };
	const end = md.indexOf('\n---', 3);
	if (end === -1) return { frontmatter: {}, body: md };
	const raw = md.slice(3, end).trim();
	const body = md.slice(end + 4);
	const frontmatter: Record<string, string> = {};
	for (const line of raw.split('\n')) {
		const colon = line.indexOf(':');
		if (colon === -1) continue;
		const key = line.slice(0, colon).trim();
		const val = line.slice(colon + 1).trim();
		frontmatter[key] = val;
	}
	return { frontmatter, body };
}

function stripFrontmatter(md: string): string {
	return parseFrontmatter(md).body;
}

function cleanInlineMarkdown(s: string): string {
	if (!s) return '';
	return (
		s
			// remove images ![alt](url)
			.replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
			// replace links [text](url) -> text
			.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
			// remove emphasis and strong
			.replace(/\*\*(.*?)\*\*/g, '$1')
			.replace(/\*(.*?)\*/g, '$1')
			.replace(/__(.*?)__/g, '$1')
			.replace(/_(.*?)_/g, '$1')
			// remove inline code `code`
			.replace(/`([^`]+)`/g, '$1')
			// remove HTML tags
			.replace(/<\/?[^>]+(>|$)/g, '')
			// collapse whitespace
			.replace(/\s+/g, ' ')
			.trim()
	);
}

function firstNSentences(text: string, n = 2): string {
	const re = /(.+?[.!?])(\s+|$)/g;
	const sentences: string[] = [];
	let m: RegExpExecArray | null;
	while ((m = re.exec(text)) && sentences.length < n && m[1]) {
		sentences.push(m[1].trim());
	}
	if (sentences.length > 0) {
		return sentences.join(' ');
	}
	// fallback to trimming by chars
	if (text.length > 200) return text.slice(0, 197).trim() + '...';
	return text.trim();
}

function extractSection(md: string, headingRegex: RegExp): string | null {
	const lines = md.split(/\r?\n/);
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;
		if (headingRegex.test(line)) {
			// collect lines after this heading until next heading of same-or-higher level
			const collected: string[] = [];
			for (let j = i + 1; j < lines.length; j++) {
				const ln = lines[j];
				if (!ln) continue;
				// stop at next heading
				if (/^\s{0,3}#{1,6}\s+/.test(ln)) break;
				// stop if we hit a fenced code block start/end
				// but we will skip code blocks entirely
				if (/^\s*```/.test(ln)) {
					// skip until closing fence
					j++;
					while (j < lines.length && lines[j] && !/^\s*```/.test(lines[j]!))
						j++;
					continue;
				}
				collected.push(ln);
			}
			return collected.join('\n').trim();
		}
	}
	return null;
}

function findFirstParagraphAfterTitle(md: string): string {
	const lines = md.split(/\r?\n/);
	let startedAfterTitle = false;
	// find and skip first H1 (if present)
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;
		const ln = line.trim();
		if (!startedAfterTitle) {
			if (/^\s*#\s+/.test(ln)) {
				startedAfterTitle = true;
				continue;
			}
			// if first non-empty line is not a title, still consider starting search from top
			if (ln !== '') {
				// start searching from this line
				startedAfterTitle = true;
				i--; // re-evaluate this line as content
				continue;
			}
		} else {
			// scan for first paragraph that looks like prose (not list, not heading, not table, not image)
			for (let j = i; j < lines.length; j++) {
				const currentLine = lines[j];
				if (!currentLine) continue;
				const l = currentLine.trim();
				if (l === '') continue;
				// skip lists, tables, headings, code fences, blockquotes, images
				if (/^\s*#{1,6}\s+/.test(l)) return ''; // encountered next heading immediate -> no paragraph here
				if (/^\s*[-*+]\s+/.test(l)) {
					i = j;
					continue;
				}
				if (/^\s*>/.test(l)) {
					i = j;
					continue;
				}
				if (/^\s*\|/.test(l)) {
					i = j;
					continue;
				}
				if (/^\s*```/.test(l)) {
					/* skip code block */ i = j;
					continue;
				}

				// found candidate paragraph, gather consecutive non-empty non-special lines
				const collected: string[] = [];
				for (let k = j; k < lines.length; k++) {
					const lk = lines[k];
					if (!lk) break;
					if (lk.trim() === '') break;
					if (
						/^\s*[-*+]\s+/.test(lk) ||
						/^\s*#{1,6}\s+/.test(lk) ||
						/^\s*>/.test(lk) ||
						/^\s*\|/.test(lk) ||
						/^\s*```/.test(lk)
					)
						break;
					collected.push(lk);
				}
				return collected.join(' ').trim();
			}
		}
	}
	return '';
}

interface SeriesInfo {
	series: string;
	series_title: string;
	module: string;
	part: number;
}

interface Metadata {
	id: string;
	title: string;
	description: string;
	tags: string[];
	seriesInfo?: SeriesInfo;
}

function extractTitleAndTagsFromMd(filename: string): {
	title: string;
	tags: string[];
} {
	const baseName = path.basename(filename, '.md');
	const parts = baseName.split('.');

	const title = parts[0];
	const tags = parts.slice(1);

	if (!title) throw new Error('No title for filename');

	return { title, tags };
}

function extractMetadataFromMd(mdContent: string, filename: string): Metadata {
	const { frontmatter, body } = parseFrontmatter(mdContent);
	mdContent = body;

	const { title: titlePart, tags: tagParts } =
		extractTitleAndTagsFromMd(filename);

	const title = titlePart.replace(/[-_]/g, ' ');

	let seriesInfo: SeriesInfo | undefined;
	if (frontmatter['series']) {
		seriesInfo = {
			series: frontmatter['series']!,
			series_title: frontmatter['series_title'] ?? '',
			module: frontmatter['module'] ?? '',
			part: parseInt(frontmatter['part'] ?? '0', 10),
		};
	}

	let metadata: Metadata = {
		id: titlePart,
		title,
		description: '',
		tags: tagParts,
		...(seriesInfo ? { seriesInfo } : {}),
	};

	// Extract title from first H1 (#) heading
	const h1Match = mdContent.match(/^\s*#\s+(.+)$/m);
	if (h1Match && h1Match[1]) {
		metadata.title = h1Match[1].trim();
	}

	// 1) Prefer "Executive Summary" section
	const execSection = extractSection(
		mdContent,
		/^\s*#{2,6}\s*Executive Summary\s*$/i,
	);
	if (execSection && execSection.length > 20) {
		const cleaned = cleanInlineMarkdown(execSection);
		metadata.description = firstNSentences(cleaned, 2);
		return metadata;
	}

	// 2) Try a few common synonyms (Summary, Overview)
	const synonyms = ['Executive Summary', 'Summary', 'Overview', 'Abstract'];
	for (const s of synonyms) {
		const sec = extractSection(
			mdContent,
			new RegExp('^\\s*#{2,6}\\s*' + s + '\\s*$', 'im'),
		);
		if (sec && sec.length > 20) {
			const cleaned = cleanInlineMarkdown(sec);
			metadata.description = firstNSentences(cleaned, 2);
			return metadata;
		}
	}

	// 3) Fallback: first meaningful paragraph after title
	let para = findFirstParagraphAfterTitle(mdContent);
	if (para && para.length > 20) {
		const cleaned = cleanInlineMarkdown(para);
		metadata.description = firstNSentences(cleaned, 2);
		return metadata;
	}

	// 4) As a last resort, try extracting the first big text blob anywhere
	const allText = cleanInlineMarkdown(mdContent).replace(/\s+/g, ' ');
	if (allText.length > 0) {
		metadata.description = firstNSentences(allText, 1);
	}

	return metadata;
}

export const extractMetaData = async () => {
	const writeupsOutputFile = jsonWriteupsOutput;
	const tagsOutputFile = jsonTagsOutput;

	// Get all .md files in the input directory
	const files = fs
		.readdirSync(inputDir)
		.filter((file): file is string => file.endsWith('.md'));

	if (files.length === 0) {
		console.log('No .md files found in', inputDir);
		process.exit(0);
	}

	console.log(`Found ${files.length} .md files to process...`);

	const tags: Set<string> = new Set<string>();

	// Process each file and extract metadata
	const metadataArray: Metadata[] = files
		.map((file) => {
			try {
				const inputPath = path.join(inputDir, file);
				const mdContent = fs.readFileSync(inputPath, 'utf8');

				const metadata = extractMetadataFromMd(mdContent, file);
				const fileTags = metadata.tags;
				fileTags.filter(Boolean).forEach((tag) => tags.add(tag.toLowerCase()));
				console.log(`✓ Extracted: ${file}`);

				return metadata;
			} catch (error: any) {
				console.error(
					`✗ Error processing ${file}:`,
					error && error.message ? error.message : error,
				);
				return {
					id: path.basename(file, '.md'),
					title: path.basename(file, '.md').replace(/[-_]/g, ' '),
					description: '',
				};
			}
		})
		.filter(
			(item): item is Metadata =>
				item !== null && typeof item === 'object' && 'id' in item,
		);

	const tagsArray = Array.from(tags);

	// Write the metadata to JSON file
	fs.writeFileSync(writeupsOutputFile, JSON.stringify(metadataArray, null, 2));
	console.log(`\n✅ Metadata saved to ${writeupsOutputFile}`);
	fs.writeFileSync(tagsOutputFile, JSON.stringify(tagsArray, null, 2));
	console.log(`\n✅ Tags saved to ${tagsOutputFile}`);

	// Also update the TypeScript file for writeups
	const tsOutputPath = path.join(process.cwd(), 'src', 'ts', 'writeups.ts');
	if (fs.existsSync(tsOutputPath)) {
		let tsContent = fs.readFileSync(tsOutputPath, 'utf8');

		// Replace the array between the markers
		const startMarker = '// AUTO-GENERATED-WRITEUPS-START';
		const endMarker = '// AUTO-GENERATED-WRITEUPS-END';

		const newArrayContent = `const writeups: Writeup[] = ${JSON.stringify(metadataArray, null, 2)} as Writeup[];`;

		// Use regex to replace content between markers
		const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g');
		const replacement = `${startMarker}\n${newArrayContent}\n${endMarker}`;

		tsContent = tsContent.replace(regex, replacement);
		fs.writeFileSync(tsOutputPath, tsContent);

		console.log(`✅ TypeScript writeups array updated in ${tsOutputPath}`);

		const tagsStartMarker = '// AUTO-GENERATED-TAGS-START';
		const tagsEndMarker = '// AUTO-GENERATED-TAGS-END';

		const tagsArrayContent = `const tags: string[] = ${JSON.stringify(tagsArray, null, 2)};`;

		const tagsRegex = new RegExp(
			`${tagsStartMarker}[\\s\\S]*?${tagsEndMarker}`,
			'g',
		);

		const tagsReplacement = `${tagsStartMarker}\n${tagsArrayContent}\n${tagsEndMarker}`;

		tsContent = tsContent.replace(tagsRegex, tagsReplacement);
		fs.writeFileSync(tsOutputPath, tsContent);

		console.log(`✅ TypeScript tags array updated in ${tsOutputPath}`);
	} else {
		console.warn(`⚠️  TypeScript writeups file not found at: ${tsOutputPath}`);
	}

	console.log(`Total files processed: ${metadataArray.length}`);
};
