import { readdirSync, readFileSync, writeFile, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { marked } from 'marked';
import { inputDir, writeupsDir } from './config';

interface SeriesInfo {
	series: string;
	series_title: string;
	module: string;
	part: number;
}

interface FileMeta {
	id: string;
	file: string;
	seriesInfo?: SeriesInfo;
}

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
		frontmatter[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
	}
	return { frontmatter, body };
}

function buildSeriesNav(current: FileMeta, allMeta: FileMeta[]): string {
	if (!current.seriesInfo) return '';
	const { series, series_title, module, part } = current.seriesInfo;

	const siblings = allMeta
		.filter((m) => m.seriesInfo?.series === series)
		.sort((a, b) => (a.seriesInfo?.part ?? 0) - (b.seriesInfo?.part ?? 0));

	const idx = siblings.findIndex((m) => m.id === current.id);
	const prev = idx > 0 ? siblings[idx - 1] : null;
	const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

	const modules = [...new Set(siblings.map((m) => m.seriesInfo?.module ?? ''))];
	const dotsHtml = modules
		.map((mod) => {
			const modParts = siblings.filter((m) => m.seriesInfo?.module === mod);
			const isActiveModule = mod === module;
			const dotClass = isActiveModule ? 'series-dot active-module' : 'series-dot';
			return `<span class="${dotClass}" title="${mod} (${modParts.length} parts)"></span>`;
		})
		.join('');

	const prevHtml = prev
		? `<a href="${prev.id}.html" class="series-nav-btn cyber-link">← ${prev.seriesInfo?.module !== module ? `[${prev.seriesInfo?.module}] ` : ''}${prev.id.replace(/_writeup$/, '').replace(/_/g, ' ')}</a>`
		: `<span class="series-nav-btn disabled">← start</span>`;

	const nextHtml = next
		? `<a href="${next.id}.html" class="series-nav-btn cyber-link">${next.seriesInfo?.module !== module ? `[${next.seriesInfo?.module}] ` : ''}${next.id.replace(/_writeup$/, '').replace(/_/g, ' ')} →</a>`
		: `<span class="series-nav-btn disabled">end →</span>`;

	return `
<div class="series-nav">
  <div class="series-nav-header">
    <span class="series-label">${series_title}</span>
    <span class="series-module">Module: ${module}</span>
    <span class="series-part">Part ${part} / ${siblings.length}</span>
  </div>
  <div class="series-nav-dots">${dotsHtml}</div>
  <div class="series-nav-links">
    ${prevHtml}
    <a href="../writeups.html" class="series-nav-btn cyber-link">↑ all writeups</a>
    ${nextHtml}
  </div>
</div>`;
}

export const generate = async () => {
	const templatePath = './src/html/template.html';

	mkdirSync(writeupsDir, { recursive: true });

	const template = readFileSync(templatePath, 'utf8');
	const files = readdirSync(inputDir).filter((file) => extname(file) === '.md');

	if (files.length === 0) {
		console.log('No Markdown files found in', inputDir);
		process.exit(0);
	}

	// First pass: collect all file metadata for series context
	const allMeta: FileMeta[] = files.map((file) => {
		const id = basename(file, '.md').split('.')[0]!;
		const raw = readFileSync(join(inputDir, file), 'utf8');
		const { frontmatter } = parseFrontmatter(raw);
		let seriesInfo: SeriesInfo | undefined;
		if (frontmatter['series']) {
			seriesInfo = {
				series: frontmatter['series']!,
				series_title: frontmatter['series_title'] ?? '',
				module: frontmatter['module'] ?? '',
				part: parseInt(frontmatter['part'] ?? '0', 10),
			};
		}
		return { id, file, seriesInfo };
	});

	// Second pass: generate HTML
	const promises = files.map(async (file) => {
		const inputPath = join(inputDir, file);
		const id = basename(file, '.md').split('.')[0]!;
		const outputPath = join(writeupsDir, id + '.html');

		const raw = readFileSync(inputPath, 'utf8');
		const { body } = parseFrontmatter(raw);

		const htmlContent = await marked.parse(body);
		const currentMeta = allMeta.find((m) => m.id === id)!;
		const seriesNav = buildSeriesNav(currentMeta, allMeta);

		const finalHtml = template
			.replace(/<div class="filter-container[\s\S]*?<\/div>/g, '')
			.replace('${series_nav}', seriesNav)
			.replace('${content}', htmlContent)
			.replace('${tags}', '');

		await new Promise<void>((resolve) =>
			writeFile(outputPath, finalHtml, () => {
				console.log(`✅ Converted ${file} → ${outputPath}`);
				resolve();
			}),
		);
	});

	await Promise.all(promises);
};
