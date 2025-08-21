import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { marked } from 'marked';

export const Generate = async () => {
	// Input and output directories
	const inputDir = './src/md';
	const outputDir = './public/writeups';

	// Template file
	const templatePath = './src/html/template.html';

	// Ensure output directory exists
	mkdirSync(outputDir, { recursive: true });

	// Read template HTML
	const template = readFileSync(templatePath, 'utf8');

	// Get Markdown files
	const files = readdirSync(inputDir).filter((file) => extname(file) === '.md');

	if (files.length === 0) {
		console.log('No Markdown files found in', inputDir);
		process.exit(0);
	}

	// Process each Markdown file
	files.forEach(async (file) => {
		const inputPath = join(inputDir, file);
		const outputPath = join(outputDir, basename(file, '.md') + '.html');

		const mdContent = readFileSync(inputPath, 'utf8');
		const htmlContent = await marked.parse(mdContent);

		// Replace placeholder in template with HTML content
		const finalHtml = template.replace('${content}', htmlContent);

		writeFileSync(outputPath, finalHtml, 'utf8');
		console.log(`✅ Converted ${file} → ${outputPath}`);
	});
};
