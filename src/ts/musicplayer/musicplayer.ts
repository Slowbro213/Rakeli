import {
	winampAudio,
	winampGraph,
	winampNext,
	winampPause,
	winampPrev,
	winampRepeat,
	winampResume,
	winampShuffle,
	winampTrackName,
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

for (let i = 0; i < BAR_COUNT; i++) {
	const bar = document.createElement('div');
	bar.classList.add('bar');
	bar.style.flex = '1';
	bar.style.background = `hsl(${(i / BAR_COUNT) * 360}, 70%, 50%)`;
	bar.style.height = '0%';
	winampGraph.appendChild(bar);
}

const bars = winampGraph.querySelectorAll('.bar');
const audioCtx = new window.AudioContext();
const source = audioCtx.createMediaElementSource(winampAudio);
const analyser = audioCtx.createAnalyser();

analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.7;
source.connect(analyser);
analyser.connect(audioCtx.destination);

const bufferLength = analyser.frequencyBinCount;
const dataArray: Uint8Array = new Uint8Array(bufferLength);
const prevHeights: Float32Array = new Float32Array(BAR_COUNT);

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

		const bar = bars[i] as HTMLElement;
		bar.style.height = height + '%';
	}

	requestAnimationFrame(animate);
}
function playSong(filePath: string) {
	winampAudio.src = filePath;
	winampAudio.load();
	winampAudio.play();
}
winampAudio.addEventListener('play', () => {
	if (audioCtx.state === 'suspended') audioCtx.resume();
	animate();
});

winampResume.onclick = () => winampAudio.play();
winampPause.onclick = () => winampAudio.pause();

function updateToggleStyles() {
	if (repeat.val) {
		winampRepeat.classList.remove('bg-gray-700', 'hover:bg-gray-600');
		winampRepeat.classList.add('bg-blue-600', 'hover:bg-blue-700');
	} else {
		winampRepeat.classList.remove('bg-blue-600', 'hover:bg-blue-700');
		winampRepeat.classList.add('bg-gray-700', 'hover:bg-gray-600');
	}
	if (shuffle.val) {
		winampShuffle.classList.remove('bg-gray-500', 'hover:bg-gray-600');
		winampShuffle.classList.add('bg-green-700', 'hover:bg-green-900');
	} else {
		winampShuffle.classList.remove('bg-green-700', 'hover:bg-green-900');
		winampShuffle.classList.add('bg-gray-500', 'hover:bg-gray-600');
	}
}

winampShuffle.onclick = () => {
	shuffleTracks();

	winampShuffle.classList.remove(
		'bg-green-700',
		'bg-gray-500',
		'hover:bg-green-900',
		'hover:bg-gray-600',
		'transition-colors',
	);
	winampShuffle.classList.add('transition-colors');

	updateToggleStyles();
};
winampRepeat.onclick = () => {
	repeatTrack();

	winampRepeat.classList.remove(
		'bg-blue-500',
		'bg-gray-500',
		'hover:bg-blue-600',
		'hover:bg-gray-600',
		'transition-colors',
	);
	winampRepeat.classList.add('transition-colors');

	updateToggleStyles();
};

winampPrev.onclick = () => {
	playSong(prevTrack());
	winampTrackName.innerHTML = currTrackName();
};
winampNext.onclick = () => {
	playSong(nextTrack());
	winampTrackName.innerHTML = currTrackName();
};
winampAudio.src = currTrack();
winampAudio.load();
winampTrackName.innerHTML = currTrackName();
