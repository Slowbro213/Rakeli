import { readdirSync, readFileSync, writeFile, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { marked } from 'marked';
import { inputDir, writeupsDir } from './config';

export const generate = async () => {
	const templatePath = './src/html/template.html';

	mkdirSync(writeupsDir, { recursive: true });

	const template = readFileSync(templatePath, 'utf8');

	const files = readdirSync(inputDir).filter((file) => extname(file) === '.md');

	if (files.length === 0) {
		console.log('No Markdown files found in', inputDir);
		process.exit(0);
	}

	files.forEach(async (file) => {
		const inputPath = join(inputDir, file);
		const outputPath = join(
			writeupsDir,
			basename(file, '.md').split('.')[0] + '.html',
		);

		const mdContent = readFileSync(inputPath, 'utf8');
		const htmlContent = await marked.parse(mdContent);

		const titleMatch = htmlContent.match(/<h1[^>]*>([^<]*)<\/h1>/);
		const pageTitle = titleMatch
			? titleMatch[1]!
			: basename(file, '.md').replace(/_/g, ' ').toUpperCase();

		const finalHtml = template
			.replace(/<div class="filter-container[\s\S]*?<\/div>/g, '')
			.replace(/\$\{series_nav\}/g, '')
			.replace('${content}', htmlContent)
			.replace('${tags}', '')
			.replace('${page_title}', pageTitle);

		writeFile(outputPath, finalHtml, () => {
			console.log(`✅ Converted ${file} → ${outputPath}`);
		});
	});
};
