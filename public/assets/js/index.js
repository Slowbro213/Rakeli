var a = document.getElementById('terminal-input'),
	S = document.getElementById('terminal-input-row'),
	x = document.getElementById('autocomplete'),
	f = document.getElementById('terminal-body'),
	m = document.getElementById('terminal-window'),
	N = document.getElementById('terminal-btn-close'),
	Y = document.getElementById('terminal-trigger');
var v = !1,
	E = !1,
	I = 0,
	D = 0,
	B = 0,
	R = 0,
	ne = (e) => {
		if ('touches' in e)
			return { clientX: e.touches[0]?.pageX, clientY: e.touches[0]?.pageY };
		else return { clientX: e.pageX, clientY: e.pageY };
	};
m.addEventListener('mousedown', (e) => {
	if (document.activeElement !== a) a.focus({ preventScroll: !0 });
	let t = m.getBoundingClientRect(),
		o = 20;
	if (e.pageX > t.right - o && e.pageY > t.bottom - o) E = !0;
});
m.onmousedown = (e) => {
	if (E) return;
	K(e);
};
m.ontouchstart = (e) => {
	if ((e.preventDefault(), E)) return;
	K(e);
};
function K(e) {
	let { clientX: t, clientY: o } = ne(e);
	if (!t || !o) return;
	((v = !0),
		(I = t),
		(D = o),
		(B = parseInt(m.style.left || '0', 10)),
		(R = parseInt(m.style.top || '0', 10)),
		(m.style.cursor = 'grabbing'),
		(m.style.userSelect = 'none'),
		(document.body.style.userSelect = 'none'));
}
document.addEventListener('mousemove', (e) => {
	if (E || !v) return;
	let t = B + (e.pageX - I),
		o = R + (e.pageY - D);
	((m.style.left = `${t}px`), (m.style.top = `${o}px`));
});
document.addEventListener(
	'touchmove',
	(e) => {
		if ((e.preventDefault(), E || !v)) return;
		let t = e.touches[0];
		if (!t) return;
		let o = B + (t.pageX - I),
			r = R + (t.pageY - D);
		((m.style.left = `${o}px`), (m.style.top = `${r}px`));
	},
	{ passive: !1 },
);
document.addEventListener('mouseup', () => {
	((v = !1),
		(E = !1),
		(m.style.cursor = ''),
		(m.style.userSelect = ''),
		(document.body.style.userSelect = ''));
});
document.addEventListener('touchend', () => {
	((v = !1),
		(E = !1),
		(m.style.cursor = ''),
		(m.style.userSelect = ''),
		(document.body.style.userSelect = ''));
});
var O = () => {
	(m.classList.remove('open'), m.classList.add('close'));
};
N.onclick = O;
var X = () => {
		(m.classList.remove('hidden'),
			m.classList.remove('close'),
			m.classList.add('open'));
	},
	H = !1;
Y.onclick = () => {
	(H ? O() : X(), (H = !H));
};
var l = (e) => {
	let t = Array.isArray(e) ? e : [e];
	for (let o of t) {
		let r = document.createElement('p');
		((r.className = 'terminal-line'),
			(r.textContent = `${o}`),
			f.appendChild(r));
	}
};
var W = {
	name: 'help',
	exec: () => {
		return (
			l([
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
var T = new Map([
	['PATH', '/aswsome/binaries'],
	['HOME', '/Rakeli/Home'],
	['WORKING_DIR', '/Rakeli/Home'],
	['EXIT_CODE', 0],
]);
var _ = {
	name: 'echo',
	exec: (e) => {
		if (!e || e.length < 2) return 1;
		let t = e.slice(1).join(' '),
			o = e[1];
		switch (o) {
			case '$?': {
				let r = T.get('EXIT_CODE');
				return (l(String(r)), 0);
			}
			default:
				if (o?.startsWith('$')) {
					let r = o.slice(1),
						n = T.get(r);
					if (n !== void 0) return (l(String(n)), 0);
					else return (l(`No such variable: ${r}`), 1);
				}
		}
		return (l(t), 0);
	},
};
var $ = {
	name: 'ls',
	exec: () => {
		return (
			l(['Pages on this Website:', 'About_Me', 'Writeups', 'Projects', 'Home']),
			0
		);
	},
};
var P = {
	name: 'cd',
	exec: () => {
		return 0;
	},
};
var z = {
	name: 'slowking',
	exec: () => {
		return (l('Thats Me!'), 0);
	},
};
var w = {
	name: 'clear',
	exec: (e) => {
		if (!f || !e) return 0;
		let t = 2,
			o = t + 1 + (e[0] === 'clear' ? 1 : 0);
		while (f.children.length > o) {
			let r = f.children[t];
			if (!r) break;
			f?.removeChild(r);
		}
		return 0;
	},
};
var y = [],
	g = 0,
	se = 100,
	V = (e) => {
		if (y[y.length - 1] === e) return;
		if (y.length === se) y.shift();
		(y.push(e), (g = y.length));
	},
	j = () => {
		if ((g--, g < 0)) g = 0;
		return y[g];
	},
	G = () => {
		if ((g++, g > y.length)) {
			g--;
			return;
		}
		return y[g];
	},
	U = () => {
		return y;
	};
var q = {
	name: 'history',
	exec: () => {
		return (l(U()), 0);
	},
};
var k = [W, _, $, P, z, w, q];
var me = (e) => {
		console.log('Building Commands...');
		let t = { children: new Map() };
		for (let o of e) {
			let r = t;
			for (let n of o.name) {
				if (!r.children.has(n)) r.children.set(n, { children: new Map() });
				r = r.children.get(n);
			}
			r.command = o;
		}
		return t;
	},
	F = (e) => {
		if (!e || b === null) return [];
		let t = b;
		for (let n of e) {
			let i = t.children.get(n);
			if (!i) return [];
			t = i;
		}
		function o(n) {
			if (n.command?.name.startsWith(e)) return n.command.name;
			if (n.line?.startsWith(e)) return n.line;
			for (let i of n.children.values()) {
				let p = o(i);
				if (p) return p;
			}
			return;
		}
		let r = o(t);
		return r ? [r] : [];
	},
	J = (e) => {
		if (!e || b === null) return;
		let t = b;
		for (let o of e) {
			let r = t.children.get(o);
			if (!r) return;
			t = r;
		}
		return t.command?.name === e ? t.command : void 0;
	},
	Z = (e, t = b) => {
		let o = t;
		for (let r of e) {
			if (!o.children.has(r)) o.children.set(r, { children: new Map() });
			o = o.children.get(r);
		}
		o.line = e;
	},
	b = me(k);
var A = () => {
	(f.removeChild(S), f.appendChild(S), a.focus());
};
var Q = (e, t) => {
	if (e === t) return 0;
	let o = e.length,
		r = t.length;
	if (o === 0 || r === 0) return o + r;
	let n = 0,
		i,
		p,
		u,
		c,
		s,
		d,
		h,
		C,
		L = new Array(o);
	for (i = 0; i < o; ) L[i] = ++i;
	for (; n + 3 < r; n += 4) {
		let M = t.charCodeAt(n),
			te = t.charCodeAt(n + 1),
			oe = t.charCodeAt(n + 2),
			re = t.charCodeAt(n + 3);
		((c = n), (u = n + 1), (s = n + 2), (d = n + 3), (h = n + 4));
		for (i = 0; i < o; i++) {
			if (((C = e.charCodeAt(i)), (p = L[i]), p < c || u < c))
				c = p > u ? u + 1 : p + 1;
			else if (M !== C) c++;
			if (c < u || s < u) u = c > s ? s + 1 : c + 1;
			else if (te !== C) u++;
			if (u < s || d < s) s = u > d ? d + 1 : u + 1;
			else if (oe !== C) s++;
			if (s < d || h < d) d = s > h ? h + 1 : s + 1;
			else if (re !== C) d++;
			((L[i] = h = d), (d = s), (s = u), (u = c), (c = p));
		}
	}
	for (; n < r; ) {
		let M = t.charCodeAt(n);
		((c = n), (s = ++n));
		for (i = 0; i < o; i++) {
			if (((p = L[i]), p < c || s < c)) s = p > s ? s + 1 : p + 1;
			else if (M !== e.charCodeAt(i)) s = c + 1;
			else s = c;
			((L[i] = s), (c = p));
		}
		h = s;
	}
	return h;
};
var ee = (e) => {
	let t = {};
	return (
		k.forEach((o) => {
			let r = Q(e, o.name);
			if (!t.name || !t.distance || t.distance > r)
				((t.name = o.name), (t.distance = r));
			return;
		}),
		t.name
	);
};
a.addEventListener('keydown', (e) => {
	if (e.ctrlKey && e.key.toLowerCase() === 'l') {
		(e.preventDefault(), w.exec(['shortcut']));
		return;
	}
	switch (e.key) {
		case 'Enter': {
			let t = a.value,
				o = t.split(' ');
			if (!t || !o || !o[0]) {
				(l('No detectable input ;-;'), A(), (a.value = ''));
				break;
			}
			let r = J(o[0]);
			if ((l('> ' + t), V(t), Z(t), !r)) {
				let n = ee(o[0]);
				if (!n) l("Command doesn't exist :(");
				else l(["Command doesn't exist, did you mean:", n]);
				(A(), (a.value = ''));
				break;
			}
			(T.set('EXIT_CODE', r.exec(o)), A(), (a.value = ''));
			break;
		}
		case 'ArrowRight': {
			let t = x.textContent?.trim();
			if (t && t.startsWith(a.value)) ((a.value = t), (x.innerHTML = ''));
			break;
		}
		case 'ArrowUp': {
			e.preventDefault();
			let t = j();
			if (((x.innerHTML = ''), !t)) break;
			((a.value = t), a.setSelectionRange(t.length, t.length));
			break;
		}
		case 'ArrowDown': {
			let t = G();
			if (((x.innerHTML = ''), !t)) {
				a.value = '';
				break;
			}
			((a.value = t), a.setSelectionRange(t.length, t.length));
			break;
		}
		default: {
			let t = a.value + e.key,
				o = F(t);
			if (o.length === 0 || !o[0]) {
				x.innerHTML = '';
				break;
			}
			let r = o[0];
			x.innerHTML = r;
			break;
		}
	}
});
document.addEventListener('keydown', (e) => {
	if (e.ctrlKey && e.key && e.key.toLowerCase() === 'n')
		(e.preventDefault(), X());
});
