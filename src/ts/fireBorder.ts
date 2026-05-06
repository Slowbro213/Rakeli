document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.querySelector('.fire-border-canvas') as HTMLCanvasElement | null;
	if (!canvas) return;

	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries[0]!.isIntersecting) return;
			observer.disconnect();
			startFire(canvas);
		},
		{ threshold: 0.1 },
	);
	observer.observe(canvas);

	function startFire(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d', { alpha: true })!;

		let w: number, h: number;
		function resize() {
			w = canvas.offsetWidth;
			h = canvas.offsetHeight;
			canvas.width = w;
			canvas.height = h;
		}
		window.addEventListener('resize', resize);
		resize();

		const NUM = 500;
		const edges: Array<(t: number) => [number, number]> = [
			(t) => [t, 0],
			(t) => [w, t],
			(t) => [w - t, h],
			(t) => [0, h - t],
		];

		class Particle {
			x = 0;
			y = 0;
			vx = 0;
			vy = 0;
			life = 0;
			maxLife = 0;
			size = 0;
			hue = 0;

			constructor() {
				this.reset();
			}

			reset() {
				const edge = Math.floor(Math.random() * 4);
				const pos = Math.random();
				[this.x, this.y] = edges[edge]!(pos * (edge % 2 === 0 ? w : h));
				this.vx = (Math.random() - 0.5) * 0.8;
				this.vy = (Math.random() - 0.5) * 0.8;
				this.life = Math.random() * 100;
				this.maxLife = 100 + Math.random() * 60;
				this.size = 1 + Math.random() * 1.5;
				this.hue = 10 + Math.random() * 25;
			}

			update() {
				this.x += this.vx + (Math.random() - 0.5) * 0.4;
				this.y += this.vy + (Math.random() - 0.5) * 0.4;
				this.life++;
				if (this.life > this.maxLife) this.reset();
			}

			draw() {
				const alpha = 1 - this.life / this.maxLife;
				const grad = ctx.createRadialGradient(
					this.x, this.y, 0,
					this.x, this.y, this.size * 8,
				);
				grad.addColorStop(0, `hsla(${this.hue},100%,60%,${alpha})`);
				grad.addColorStop(0.5, `hsla(${this.hue + 20},100%,50%,${alpha * 0.7})`);
				grad.addColorStop(1, `hsla(${this.hue + 40},100%,30%,0)`);
				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size * 8, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		const particles: Particle[] = [];
		for (let i = 0; i < NUM; i++) particles.push(new Particle());

		function loop() {
			ctx.globalCompositeOperation = 'lighter';
			ctx.clearRect(0, 0, w, h);
			for (const p of particles) {
				p.update();
				p.draw();
			}
			requestAnimationFrame(loop);
		}
		loop();
	}
});
