import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚧 Using streamlined writeups index generator...');

interface SeriesInfo {
	series: string;
	series_title: string;
	module: string;
	part: number;
}

interface Writeup {
	id: string;
	title: string;
	description: string;
	tags: string[];
	seriesInfo?: SeriesInfo;
}

// Configuration
const writeupsJsonPath = join(process.cwd(), 'out', 'writeups.json');
const tagsJsonPath = join(process.cwd(), 'out', 'tags.json');
const outputPath = join(process.cwd(), 'public', 'writeups.html');
const templatePath = join(process.cwd(), 'src', 'html', 'template.html');

function buildSeriesSection(writeups: Writeup[]): string {
	// Group by series id
	const seriesMap = new Map<string, Writeup[]>();
	for (const w of writeups) {
		if (!w.seriesInfo) continue;
		const key = w.seriesInfo.series;
		if (!seriesMap.has(key)) seriesMap.set(key, []);
		seriesMap.get(key)!.push(w);
	}
	if (seriesMap.size === 0) return '';

	const seriesCards = [...seriesMap.entries()]
		.map(([, parts]) => {
			const sorted = [...parts].sort(
				(a, b) => (a.seriesInfo?.part ?? 0) - (b.seriesInfo?.part ?? 0),
			);
			const first = sorted[0]!;
			const { series_title } = first.seriesInfo!;

			// Group parts by module
			const moduleMap = new Map<string, Writeup[]>();
			for (const p of sorted) {
				const mod = p.seriesInfo?.module ?? 'Other';
				if (!moduleMap.has(mod)) moduleMap.set(mod, []);
				moduleMap.get(mod)!.push(p);
			}

			const modulesHtml = [...moduleMap.entries()]
				.map(([mod, modParts]) => {
					const partLinks = modParts
						.map(
							(p) =>
								`<a href="writeups/${p.id}.html" class="playlist-part-link cyber-link">
                  <span class="playlist-part-num">${p.seriesInfo!.part}</span>
                  <span class="playlist-part-title">${p.title}</span>
                </a>`,
						)
						.join('');
					return `<div class="playlist-module">
              <div class="playlist-module-name">${mod}</div>
              <div class="playlist-parts">${partLinks}</div>
            </div>`;
				})
				.join('');

			return `
    <div class="series-card">
      <div class="series-card-header">
        <h2 class="series-card-title cyber-text">${series_title}</h2>
        <span class="series-card-count">${sorted.length} parts</span>
      </div>
      <div class="playlist-modules">${modulesHtml}</div>
      <a href="writeups/${first.id}.html" class="writeup-link cyber-link mt-4 inline-block">START →</a>
    </div>`;
		})
		.join('');

	return `
    <div class="series-section">
      <details class="series-details" open>
        <summary class="series-section-title cyber-text">
          SERIES &amp; PLAYLISTS
          <span class="series-toggle-icon" aria-hidden="true"></span>
        </summary>
        <div class="series-grid">${seriesCards}</div>
      </details>
    </div>
    <div class="section-divider"></div>`;
}

export async function generateWriteupsIndex() {
	try {
		if (!existsSync(writeupsJsonPath)) {
			console.error(`❌ writeups.json not found at: ${writeupsJsonPath}`);
			process.exit(1);
		}

		const writeupsData = readFileSync(writeupsJsonPath, 'utf8');
		const writeups: Writeup[] = JSON.parse(writeupsData);
		console.log(`📊 Found ${writeups.length} writeups to process`);

		if (!existsSync(templatePath)) {
			console.error(`❌ Template file not found at: ${templatePath}`);
			process.exit(1);
		}
		let template = readFileSync(templatePath, 'utf8');

		const writeupsHtml = writeups
			.map((writeup) => {
				const seriesBadge = writeup.seriesInfo
					? `<span class="series-badge">${writeup.seriesInfo.series_title} · Part ${writeup.seriesInfo.part}</span>`
					: '';
				const tagsHtml =
					writeup.tags && writeup.tags.length
						? `<div>${writeup.tags.map((tag) => `<button type="button">${tag}</button>`).join('')}</div>`
						: '';
				return `
  <div class="writeup-card" data-id="${writeup.id}" data-series="${writeup.seriesInfo?.series ?? ''}">
    ${seriesBadge}
    <h2 class="writeup-title cyber-text">${writeup.title}</h2>
    <p class="writeup-description">${writeup.description}</p>
    ${tagsHtml}
    <a href="writeups/${writeup.id}.html" class="writeup-link cyber-link">READ_WRITEUP</a>
  </div>`;
			})
			.join('');

		const itemsPerPage = 6;
		const pageCount = Math.ceil(writeups.length / itemsPerPage);
		const paginationHtml =
			pageCount > 1
				? `<div class="pagination-controls">
            <button type="button" id="prevPage" class="pagination-btn cyber-button">PREV</button>
            <span class="page-info cyber-text">PAGE <span id="currentPage">1</span> / ${pageCount}</span>
            <button type="button" id="nextPage" class="pagination-btn cyber-button">NEXT</button>
          </div>`
				: '';

		let tags: string[] = [];
		if (existsSync(tagsJsonPath)) {
			tags = JSON.parse(readFileSync(tagsJsonPath, 'utf8'));
		}
		const tagsHtml = tags
			.map(
				(t) =>
					`<button type="button" class="tag small" data-tag="${t}">${t}</button>`,
			)
			.join('');

		const seriesSection = buildSeriesSection(writeups);

		const mainContent = `
      <div class="writeups-container">
        <h1 class="cyber-text glitch-effect text-center" data-text="PENETRATION_TESTING_WRITEUPS">
          PENETRATION_TESTING_WRITEUPS
        </h1>
        <div class="text-center mt-4">
          <a href="blogs.html" class="writeup-link cyber-link">VIEW_BLOGS</a>
        </div>

        ${seriesSection}

        <h2 class="section-all-title cyber-text">ALL WRITEUPS</h2>
        <div id="writeupsList" class="writeups-grid">
          ${writeupsHtml}
        </div>
        <div class="pagination mt-8">${paginationHtml}</div>
      </div>
    `;

		const templateWithStyles = template.replace(
			'</head>',
			`  <link rel="stylesheet" href="assets/css/writeupIndex.css" /></head>`,
		);

		const finalHtml = templateWithStyles
			.replace('${content}', mainContent)
			.replace('${series_nav}', '')
			.replace('${tags}', tagsHtml)
			.replace(
				'</body>',
				`  <script type="module" src="assets/js/writeups.js" defer></script></body>`,
			)
			.replace(
				`
		<link rel="stylesheet" href="../assets/css/writeups.css" />
`,
				`		<link rel="stylesheet" href="assets/css/writeups.css" />`,
			)
			.replace(
				/<a href="\.\.\/(index\.html|about\.html|writeups\.html|blogs\.html)" class="nav-link">(HOME|ABOUT|WRITEUPS|BLOGS)<\/a>/g,
				(_match, p1, p2) => `<a href="${p1}" class="nav-link">${p2}</a>`,
			)
			.replace(
				`<script type="module" src="../assets/js/menu.js" defer></script>`,
				`<script type="module" src="assets/js/menu.js" defer></script>`,
			);

		writeFileSync(outputPath, finalHtml);
		console.log(`✅ Writeups index generated successfully at: ${outputPath}`);
	} catch (error) {
		console.error('❌ Error generating writeups index:', error);
		process.exit(1);
	}
}
