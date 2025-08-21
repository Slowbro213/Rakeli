const fs = require('fs');
const path = require('path');
const css = require('css');

if (process.argv.length < 3) {
	console.error('Usage: node fix-styles.js <path/to/styles.css>');
	process.exit(1);
}

const filePath = process.argv[2];
if (!fs.existsSync(filePath)) {
	console.error('File not found:', filePath);
	process.exit(1);
}

function camelToKebab(name) {
	return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const raw = fs.readFileSync(filePath, 'utf8');
const ast = css.parse(raw, { source: filePath });

const keyframeMap = new Map();

function traverseAndRenameKeyframes(rules) {
	for (const rule of rules.slice()) {
		if (!rule) continue;
		if (rule.type === 'keyframes' || (rule.type === 'rule' && rule.keyframes)) {
			const oldName = rule.name;
			const newName = camelToKebab(oldName);
			if (oldName !== newName) {
				keyframeMap.set(oldName, newName);
				rule.name = newName;
			}
		} else if (rule.type === 'media' || rule.type === 'supports') {
			if (Array.isArray(rule.rules)) traverseAndRenameKeyframes(rule.rules);
		}
	}
}

traverseAndRenameKeyframes(ast.stylesheet.rules);

function replaceAnimationNamesInValue(value) {
	if (!value || keyframeMap.size === 0) return value;
	let out = value;
	for (const [oldName, newName] of keyframeMap) {
		const re = new RegExp(`\\b${oldName}\\b`, 'g');
		out = out.replace(re, newName);
	}
	return out;
}

function traverseAndUpdateDeclarations(rules) {
	for (const rule of rules.slice()) {
		if (!rule) continue;
		if (
			rule.type === 'rule' ||
			rule.type === 'keyframes' ||
			rule.type === 'page'
		) {
			if (Array.isArray(rule.declarations)) {
				for (const decl of rule.declarations) {
					if (!decl || !decl.property || decl.type !== 'declaration') continue;
					const prop = decl.property.toLowerCase();
					if (
						prop === 'animation' ||
						prop === 'animation-name' ||
						prop.endsWith('animation') ||
						prop.endsWith('animation-name')
					) {
						decl.value = replaceAnimationNamesInValue(decl.value);
					} else {
						decl.value = replaceAnimationNamesInValue(decl.value);
					}
				}
			}
		} else if (rule.type === 'media' || rule.type === 'supports') {
			if (Array.isArray(rule.rules)) traverseAndUpdateDeclarations(rule.rules);
		}
	}
}

traverseAndUpdateDeclarations(ast.stylesheet.rules);

function removeDuplicateSelectors(rules) {
	function recurse(rules, scopeKey = '') {
		const seen = new Set();
		for (let i = 0; i < rules.length; ) {
			const rule = rules[i];
			if (!rule) {
				i++;
				continue;
			}

			if (rule.type === 'rule') {
				const selectorText = rule.selectors
					? rule.selectors.map((s) => s.trim()).join(', ')
					: (rule.selector || '').trim();

				const key = scopeKey + '|' + selectorText;
				if (seen.has(key)) {
					rules.splice(i, 1);
					continue;
				} else {
					seen.add(key);
				}
			} else if (rule.type === 'media' || rule.type === 'supports') {
				const atKey =
					scopeKey +
					`@${rule.type} ${rule.media || rule.condition || ''}`.trim();
				if (Array.isArray(rule.rules)) {
					recurse(rule.rules, atKey);
				}
			} else if (rule.type === 'keyframes') {
			}
			i++;
		}
	}

	recurse(rules, '');
}

removeDuplicateSelectors(ast.stylesheet.rules);

function reorderForDescendingSpecificity(rules) {
	function baseOfSelector(sel) {
		return sel
			.split(',')
			.map((s) => s.trim())
			.map((s) => {
				const parts = s.split(/:+/);
				return parts[0].trim();
			});
	}

	function shouldRuleBeAfter(a, b) {
		const aSel = a.selectors ? a.selectors.join(', ') : a.selector || '';
		const bSel = b.selectors ? b.selectors.join(', ') : b.selector || '';
		const aBases = baseOfSelector(aSel);
		const bBases = baseOfSelector(bSel);

		for (let i = 0; i < aBases.length; ++i) {
			const aBase = aBases[i];
			for (let j = 0; j < bBases.length; ++j) {
				const bBase = bBases[j];
				if (aBase && bBase && aBase === bBase) {
					const aHasPseudo = /[:]{1,2}/.test(aSel);
					const bHasPseudo = /[:]{1,2}/.test(bSel);
					if (aHasPseudo && !bHasPseudo) return true;
					if (!aHasPseudo && bHasPseudo) return false;
				}
			}
		}
		return null;
	}

	function recurse(rules) {
		for (let pass = 0; pass < 3; pass++) {
			for (let i = 0; i < rules.length - 1; i++) {
				const a = rules[i];
				const b = rules[i + 1];
				if (!a || !b) continue;
				if (a.type === 'rule' && b.type === 'rule') {
					const res = shouldRuleBeAfter(a, b);
					if (res === true) {
						rules[i] = b;
						rules[i + 1] = a;
					} else if (res === false) {
						// ok
					}
				}
			}
		}

		for (const rule of rules) {
			if (
				rule &&
				(rule.type === 'media' || rule.type === 'supports') &&
				Array.isArray(rule.rules)
			) {
				recurse(rule.rules);
			}
		}
	}

	recurse(rules);
}

reorderForDescendingSpecificity(ast.stylesheet.rules);

const output = css.stringify(ast, { compress: false });
const backupPath = filePath + '.bak';
fs.copyFileSync(filePath, backupPath);
fs.writeFileSync(filePath, output, 'utf8');

console.log('✅ Fixed CSS written to', filePath);
console.log('Backup of original saved to', backupPath);
if (keyframeMap.size > 0) {
	console.log(
		'Renamed keyframes:',
		Array.from(keyframeMap.entries())
			.map(([o, n]) => `${o} → ${n}`)
			.join(', '),
	);
} else {
	console.log('No keyframe renames needed.');
}
