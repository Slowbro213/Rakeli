var p = document.getElementById('terminal-input'),
	T = document.getElementById('terminal-input-row'),
	g = document.getElementById('autocomplete'),
	d = document.getElementById('terminal-body'),
	G = document.getElementById('terminal-line-template');
var i = (t) => {
	let e = Array.isArray(t) ? t : [t];
	for (let o of e) {
		let r = document.createElement('p');
		((r.className = 'terminal-line'),
			(r.textContent = `${o}`),
			d.appendChild(r));
	}
};
var H = {
	name: 'help',
	exec: () => {
		return (
			i([
				'help',
				'ls',
				'cd ( doesnt work yet )',
				'slowking',
				'echo',
				'clear',
				'history',
			]),
			0
		);
	},
};
var E = new Map([
	['PATH', '/aswsome/binaries'],
	['HOME', '/Rakeli/Home'],
	['WORKING_DIR', '/Rakeli/Home'],
	['EXIT_CODE', 0],
]);
var v = {
	name: 'echo',
	exec: (t) => {
		if (!t || t.length < 2) return 1;
		let e = t.slice(1).join(' '),
			o = t[1];
		switch (o) {
			case '$?': {
				let r = E.get('EXIT_CODE');
				return (i(String(r)), 0);
			}
			default:
				if (o?.startsWith('$')) {
					let r = o.slice(1),
						n = E.get(r);
					if (n !== void 0) return (i(String(n)), 0);
					else return (i(`No such variable: ${r}`), 1);
				}
		}
		return (i(e), 0);
	},
};
var I = {
	name: 'ls',
	exec: () => {
		return (
			i(['Pages on this Website:', 'About_Me', 'Writeups', 'Projects', 'Home']),
			0
		);
	},
};
var M = {
	name: 'cd',
	exec: () => {
		return 0;
	},
};
var N = {
	name: 'slowking',
	exec: () => {
		return (i('Thats Me!'), 0);
	},
};
var k = {
	name: 'clear',
	exec: (t) => {
		if (!d || !t) return 0;
		let e = 2,
			o = e + 1 + (t[0] === 'clear' ? 1 : 0);
		while (d.children.length > o) {
			let r = d.children[e];
			if (!r) break;
			d?.removeChild(r);
		}
		return 0;
	},
};
var y = [],
	u = 0,
	D = (t) => {
		if (y[y.length - 1] === t) return;
		(y.push(t), (u = y.length));
	},
	S = () => {
		if ((u--, u < 0)) u = 0;
		return y[u];
	},
	B = () => {
		if ((u++, u > y.length)) {
			u--;
			return;
		}
		return y[u];
	},
	O = () => {
		return y;
	};
var R = {
	name: 'history',
	exec: () => {
		return (i(O()), 0);
	},
};
var w = [H, v, I, M, N, k, R];
var j = (t) => {
		console.log('Building Commands...');
		let e = { children: new Map() };
		for (let o of t) {
			let r = e;
			for (let n of o.name) {
				if (!r.children.has(n)) r.children.set(n, { children: new Map() });
				r = r.children.get(n);
			}
			r.command = o;
		}
		return e;
	},
	_ = (t) => {
		if (!t || b === null) return [];
		let e = b;
		for (let n of t) {
			let s = e.children.get(n);
			if (!s) return [];
			e = s;
		}
		function o(n) {
			if (n.command && n.command.name.startsWith(t)) return n.command;
			for (let s of n.children.values()) {
				let l = o(s);
				if (l) return l;
			}
			return;
		}
		let r = o(e);
		return r ? [r] : [];
	},
	K = (t) => {
		if (!t || b === null) return;
		let e = b;
		for (let o of t) {
			let r = e.children.get(o);
			if (!r) return;
			e = r;
		}
		return e.command?.name === t ? e.command : void 0;
	},
	b = j(w);
var A = () => {
	(d.removeChild(T), d.appendChild(T), p.focus());
};
var P = (t, e) => {
	if (t === e) return 0;
	let o = t.length,
		r = e.length;
	if (o === 0 || r === 0) return o + r;
	let n = 0,
		s,
		l,
		c,
		a,
		m,
		f,
		h,
		x,
		C = new Array(o);
	for (s = 0; s < o; ) C[s] = ++s;
	for (; n + 3 < r; n += 4) {
		let L = e.charCodeAt(n),
			$ = e.charCodeAt(n + 1),
			V = e.charCodeAt(n + 2),
			X = e.charCodeAt(n + 3);
		((a = n), (c = n + 1), (m = n + 2), (f = n + 3), (h = n + 4));
		for (s = 0; s < o; s++) {
			if (((x = t.charCodeAt(s)), (l = C[s]), l < a || c < a))
				a = l > c ? c + 1 : l + 1;
			else if (L !== x) a++;
			if (a < c || m < c) c = a > m ? m + 1 : a + 1;
			else if ($ !== x) c++;
			if (c < m || f < m) m = c > f ? f + 1 : c + 1;
			else if (V !== x) m++;
			if (m < f || h < f) f = m > h ? h + 1 : m + 1;
			else if (X !== x) f++;
			((C[s] = h = f), (f = m), (m = c), (c = a), (a = l));
		}
	}
	for (; n < r; ) {
		let L = e.charCodeAt(n);
		((a = n), (m = ++n));
		for (s = 0; s < o; s++) {
			if (((l = C[s]), l < a || m < a)) m = l > m ? m + 1 : l + 1;
			else if (L !== t.charCodeAt(s)) m = a + 1;
			else m = a;
			((C[s] = m), (a = l));
		}
		h = m;
	}
	return h;
};
var W = (t) => {
	let e = {};
	return (
		w.forEach((o) => {
			let r = P(t, o.name);
			if (!e.name || !e.distance || e.distance > r)
				((e.name = o.name), (e.distance = r));
			return;
		}),
		e.name
	);
};
p.addEventListener('keydown', (t) => {
	if (t.ctrlKey && t.key.toLowerCase() === 'l') {
		(t.preventDefault(), k.exec(['shortcut']));
		return;
	}
	switch (t.key) {
		case 'Enter': {
			let e = p.value,
				o = e.split(' ');
			if (!e || !o || !o[0]) {
				(i('No detectable input ;-;'), A(), (p.value = ''));
				break;
			}
			let r = K(o[0]);
			if ((i('> ' + e), D(e), !r)) {
				let n = W(o[0]);
				if (!n) i("Command doesn't exist :(");
				else i(["Command doesn't exist, did you mean:", n]);
				(A(), (p.value = ''));
				break;
			}
			(E.set('EXIT_CODE', r.exec(o)), A(), (p.value = ''));
			break;
		}
		case 'ArrowRight': {
			let e = g.textContent?.trim();
			if (e && e.startsWith(p.value)) ((p.value = e), (g.innerHTML = ''));
			break;
		}
		case 'ArrowUp': {
			t.preventDefault();
			let e = S();
			if (((g.innerHTML = ''), !e)) break;
			((p.value = e), p.setSelectionRange(e.length, e.length));
			break;
		}
		case 'ArrowDown': {
			let e = B();
			if (((g.innerHTML = ''), !e)) {
				p.value = '';
				break;
			}
			((p.value = e), p.setSelectionRange(e.length, e.length));
			break;
		}
		default: {
			let e = p.value,
				o = _(e);
			if (o.length === 0 || !o[0] || !o[0].name) {
				g.innerHTML = '';
				break;
			}
			let r = o[0].name;
			g.innerHTML = r;
			break;
		}
	}
});
