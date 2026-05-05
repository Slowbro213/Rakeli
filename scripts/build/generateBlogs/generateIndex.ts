import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚧 Using streamlined blogs index generator...');

interface Blog {
	id: string;
	title: string;
	description: string;
	tags: string[];
}

const blogsJsonPath = join(process.cwd(), 'out', 'blogs.json');
const tagsJsonPath = join(process.cwd(), 'out', 'blog-tags.json');
const outputPath = join(process.cwd(), 'public', 'blogs.html');
const templatePath = join(process.cwd(), 'src', 'html', 'template.html');

export async function generateBlogsIndex() {
	try {
		if (!existsSync(blogsJsonPath)) {
			console.error(`❌ blogs.json not found at: ${blogsJsonPath}`);
			process.exit(1);
		}

		const blogsData = readFileSync(blogsJsonPath, 'utf8');
		const blogs: Blog[] = JSON.parse(blogsData);

		console.log(`📊 Found ${blogs.length} blogs to process`);

		if (!existsSync(templatePath)) {
			console.error(`❌ Template file not found at: ${templatePath}`);
			process.exit(1);
		}
		const template = readFileSync(templatePath, 'utf8');
		const blogsHtml = blogs
			.map(
				(blog) => `
  <div class="writeup-card" data-id="${blog.id}">
    <h2 class="writeup-title cyber-text">${blog.title}</h2>
    <p class="writeup-description">${blog.description}</p>
    ${
			blog.tags && blog.tags.length
				? `<div>${blog.tags.map((tag) => `<button type="button" class="tag small" data-tag="${tag}">${tag}</button>`).join('')}</div>`
				: ''
		}
    <a href="blogs/${blog.id}.html" class="writeup-link cyber-link">
      READ_BLOG
    </a>
  </div>`,
			)
			.join('');

		const itemsPerPage = 6;
		const pageCount = Math.ceil(blogs.length / itemsPerPage);
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
			const tagsData = readFileSync(tagsJsonPath, 'utf8');
			tags = JSON.parse(tagsData);
		} else {
			console.warn(
				`⚠️ blog-tags.json not found at: ${tagsJsonPath} (continuing without tags)`,
			);
		}
		const tagsHtml = (tags ?? [])
			.map(
				(t) =>
					`<button type="button"
        class="tag small"
        data-tag="${t}">
        ${t}
      </button>`,
			)
			.join('');

		const mainContent = `
      <div class="writeups-container">
        <h1 class="cyber-text glitch-effect text-center" data-text="BLOG_POSTS">
          BLOG_POSTS
        </h1>

        <div class="text-center mt-4">
          <a href="writeups.html" class="writeup-link cyber-link">VIEW_WRITEUPS</a>
        </div>

        <div id="writeupsList" class="writeups-grid">
          ${blogsHtml}
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
			.replace(/\$\{series_nav\}/g, '')
			.replace('${tags}', tagsHtml)
			.replace('${page_title}', 'BLOGS')
			.replace(
				'</body>',
				`  <script type="module" src="assets/js/blogs.js" defer></script></body>`,
			)
			.replace(
				/<link rel="stylesheet" href="\.\.\/assets\/css\/writeups\.css" \/>/,
				`<link rel="stylesheet" href="assets/css/writeups.css" />`,
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
		console.log(`✅ Blogs index generated successfully at: ${outputPath}`);
	} catch (error) {
		console.error('❌ Error generating blogs index:', error);
		process.exit(1);
	}
}
