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
	currTrack,
	currTrackName,
	nextTrack,
	prevTrack,
	repeat,
	repeatTrack,
	shuffle,
	shuffleTracks,
} from './tracks';

const BAR_COUNT = 64;
const audioCtx = new window.AudioContext();
const source = audioCtx.createMediaElementSource(winampAudio);
const analyser = audioCtx.createAnalyser();
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const prevHeights = new Float32Array(BAR_COUNT);

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
	winampAudio.play();
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
	playSong(prevTrack());
	winampTrackName.innerHTML = currTrackName();
};
winampNext.onclick = () => {
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

// Mouse events
progressContainer.addEventListener('mousedown', () => {
	isSeeking = true;
});

progressContainer.addEventListener('mousemove', (e: MouseEvent) => {
	if (isSeeking) {
		seekAudio(e.clientX);
	}
});

progressContainer.addEventListener('mouseup', () => {
	isSeeking = false;
});

progressContainer.addEventListener('mouseleave', () => {
	isSeeking = false;
});

// Touch events
progressContainer.addEventListener(
	'touchstart',
	(e: TouchEvent) => {
		isSeeking = true;
		if (e.touches.length > 0 && e.touches[0]) {
			seekAudio(e.touches[0].clientX);
		}
	},
	{ passive: false },
);

progressContainer.addEventListener(
	'touchmove',
	(e: TouchEvent) => {
		if (isSeeking && e.touches.length > 0 && e.touches[0]) {
			seekAudio(e.touches[0].clientX);
		}
	},
	{ passive: false },
);

progressContainer.addEventListener('touchend', () => {
	isSeeking = false;
});

// Initial setup
winampAudio.src = currTrack();
winampAudio.load();
winampTrackName.innerHTML = currTrackName();
updateToggleStyles();
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

let open = false;
winampTrigger.onclick = () => {
	if (open) closeMusicPlayer();
	else openMusicPlayer();
};

makeDraggable(winampWindow);
