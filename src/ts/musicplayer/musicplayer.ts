import { makeDraggable } from '@rakeli/drag';
import {
	winampAudio,
	winampBar,
	winampGraph,
	winampNext,
	winampPause,
	winampPrev,
	winampRepeat,
	winampResume,
	winampShuffle,
	winampTrackName,
	winampTrigger,
	winampWindow,
} from './playerParts';

import {
	currTrackName,
	nextTrack,
	prevTrack,
	repeat,
	repeatTrack,
	shuffle,
	shuffleTracks,
} from './tracks';
import { tracks } from './registry';

const BAR_COUNT = 64;
const audioCtx = new window.AudioContext();
const source = audioCtx.createMediaElementSource(winampAudio);
const analyser = audioCtx.createAnalyser();
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const prevHeights = new Float32Array(BAR_COUNT);

function initAudio() {
	if (audioCtx.state === 'suspended') {
		void audioCtx.resume();
	}
}

// Setup analyzer
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.7;
source.connect(analyser);
analyser.connect(audioCtx.destination);

// Create visualizer bars
for (let i = 0; i < BAR_COUNT; i++) {
	const bar = document.createElement('div');
	bar.classList.add('bar');
	bar.style.flex = '1';
	bar.style.background = `hsl(${(i / BAR_COUNT) * 360}, 70%, 50%)`;
	bar.style.height = '0%';
	winampGraph.appendChild(bar);
}
const bars = winampGraph.querySelectorAll('.bar');

// Animate visualizer
function animate() {
	analyser.getByteFrequencyData(dataArray);
	for (let i = 0; i < BAR_COUNT; i++) {
		const start = Math.floor((i * bufferLength) / BAR_COUNT);
		const end = Math.max(
			start + 1,
			Math.floor(((i + 1) * bufferLength) / BAR_COUNT),
		);
		let sum = 0;
		for (let j = start; j < end; j++) sum += dataArray[j]!;
		const value = sum / (end - start) / 255;
		const scaled = Math.pow(value, 1.3) * 100;
		const height = prevHeights[i]! * 0.6 + scaled * 0.4;
		prevHeights[i] = height;
		(bars[i] as HTMLElement).style.height = `${height}%`;
	}
	requestAnimationFrame(animate);
}

// Play a track
function playSong(filePath: string) {
	winampAudio.src = filePath;
	winampAudio.load();
	winampAudio.play().catch(() => {
		console.warn("Autoplay blocked, waiting for user interaction.");
	});
}

// Update toggle button styles
function updateToggleStyles() {
	winampRepeat.classList.toggle('bg-blue-600', repeat.val);
	winampRepeat.classList.toggle('hover:bg-blue-700', repeat.val);
	winampRepeat.classList.toggle('bg-gray-700', !repeat.val);
	winampRepeat.classList.toggle('hover:bg-gray-600', !repeat.val);

	winampShuffle.classList.toggle('bg-green-700', shuffle.val);
	winampShuffle.classList.toggle('hover:bg-green-900', shuffle.val);
	winampShuffle.classList.toggle('bg-gray-500', !shuffle.val);
	winampShuffle.classList.toggle('hover:bg-gray-600', !shuffle.val);
}

// Track control event listeners
winampAudio.addEventListener('play', () => {
	if (audioCtx.state === 'suspended') audioCtx.resume();
	animate();
});
winampResume.onclick = () => winampAudio.play();
winampPause.onclick = () => winampAudio.pause();

winampPrev.onclick = () => {
	if (!tracks.length) return;
	playSong(prevTrack());
	winampTrackName.innerHTML = currTrackName();
};
winampNext.onclick = () => {
	if (!tracks.length) return;
	playSong(nextTrack());
	winampTrackName.innerHTML = currTrackName();
};

winampRepeat.onclick = () => {
	repeatTrack();
	winampRepeat.classList.add('transition-colors');
	updateToggleStyles();
};

winampShuffle.onclick = () => {
	shuffleTracks();
	winampShuffle.classList.add('transition-colors');
	updateToggleStyles();
};

// Progress bar update
const progress = document.getElementById('winamp-progress') as HTMLElement;
winampAudio.addEventListener('timeupdate', () => {
	if (winampAudio.duration) {
		const percent = (winampAudio.currentTime / winampAudio.duration) * 100;
		progress.style.width = `${percent}%`;
	}
});

const progressContainer = winampBar.parentElement!;
let isSeeking = false;

function seekAudio(clientX: number) {
	const rect = progressContainer.getBoundingClientRect();
	const clickX = clientX - rect.left;
	const percent = Math.max(0, Math.min(1, clickX / rect.width));
	winampAudio.currentTime = percent * winampAudio.duration;
	progress.style.width = `${percent * 100}%`;
}

// Seek handlers
['mousedown', 'touchstart'].forEach(evt =>
	progressContainer.addEventListener(evt, () => (isSeeking = true)),
);

['mouseup', 'mouseleave', 'touchend'].forEach(evt =>
	progressContainer.addEventListener(evt, () => (isSeeking = false)),
);

progressContainer.addEventListener('mousemove', (e: MouseEvent) => {
	if (isSeeking) seekAudio(e.clientX);
});
progressContainer.addEventListener('touchmove', (e: TouchEvent) => {
	const firstTouch = e.touches.item(0);
	if (isSeeking && firstTouch) seekAudio(firstTouch.clientX);
});

// === FINAL AUTOPLAY LOGIC (No click needed if autoplay allowed) ===
window.addEventListener("load", async () => {
	updateToggleStyles();

	if (!tracks.length) {
		winampTrackName.innerHTML = 'NO TRACKS LOADED';
		return;
	}

	shuffle.val = true;
	const randomTrack = nextTrack();
	playSong(randomTrack);
	winampTrackName.innerHTML = currTrackName();

	winampAudio.volume = 0.4; // normal volume by default

	const tryAutoplay = async () => {
		try {
			// try to init and play immediately
			initAudio();
			await audioCtx!.resume();
			await winampAudio.play();
			console.info("🎶 Autoplay started successfully");
			localStorage.setItem("audioUnlocked", "true");
			return true;
		} catch (err) {
			console.warn("⚠️ Autoplay blocked, waiting for interaction");
			return false;
		}
	};

	const autoplayWorked = await tryAutoplay();

	// Fallback: if autoplay blocked, wait for interaction once
	if (!autoplayWorked) {
		const unlockAudio = async () => {
			initAudio();
			await audioCtx!.resume();
			await winampAudio.play();
			console.info("▶️ Audio unlocked by user interaction");
			document.removeEventListener("click", unlockAudio);
			document.removeEventListener("scroll", unlockAudio);
			document.removeEventListener("keydown", unlockAudio);
		};
		document.addEventListener("click", unlockAudio);
		document.addEventListener("scroll", unlockAudio);
		document.addEventListener("keydown", unlockAudio);
	}
});



// Time display
const currentTimeEl = document.getElementById('current-time')!;
const totalTimeEl = document.getElementById('total-time')!;
function formatTime(time: number): string {
	const minutes = Math.floor(time / 60)
		.toString()
		.padStart(2, '0');
	const seconds = Math.floor(time % 60)
		.toString()
		.padStart(2, '0');
	return `${minutes}:${seconds}`;
}
winampAudio.addEventListener('timeupdate', () => {
	currentTimeEl.textContent = formatTime(winampAudio.currentTime);
});
winampAudio.addEventListener('loadedmetadata', () => {
	totalTimeEl.textContent = formatTime(winampAudio.duration);
});

// Player toggle
let open = false;
const closeMusicPlayer = () => {
	winampWindow.classList.remove('open');
	winampWindow.classList.add('close');
	open = false;
};
const openMusicPlayer = () => {
	winampWindow.classList.remove('hidden');
	winampWindow.classList.remove('close');
	winampWindow.classList.add('open');
	open = true;
};
winampTrigger.onclick = () => (open ? closeMusicPlayer() : openMusicPlayer());

// Make draggable
makeDraggable(winampWindow);

