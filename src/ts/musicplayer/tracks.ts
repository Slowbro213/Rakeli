import { tracks } from './registry';
import { getRandomIntExcluding } from '@rakeli/utils/random';

const storageUrl = 'assets/storage/mp3/';

const curr = { val: 0 };
export const repeat = { val: false };
export const shuffle = { val: false };

export const nextTrack = (): string => {
	if (repeat.val) return currTrack();
	if (shuffle.val) curr.val = getRandomIntExcluding(0, tracks.length, curr.val);
	else curr.val = (curr.val + 1) % tracks.length;
	return currTrack();
};

export const prevTrack = (): string => {
	if (repeat.val) return currTrack();
	if (shuffle.val) {
		curr.val = getRandomIntExcluding(0, tracks.length, curr.val);
	} else {
		curr.val = curr.val - 1;
		if (curr.val < 0) curr.val = tracks.length - 1;
	}
	return currTrack();
};

export const shuffleTracks = () => {
	shuffle.val = !shuffle.val;
	repeat.val = false;
};

export const repeatTrack = () => {
	repeat.val = !repeat.val;
	shuffle.val = false;
};

export const currTrack = (): string => {
	const track = tracks[curr.val];
	if (!track) {
		console.error('No track :(', curr.val);
		return storageUrl + 'error.mp3';
	}
	return storageUrl + track;
};

export const currTrackName = (): string => {
	const track = tracks[curr.val];
	if (!track) {
		console.error('No track :(');
		return 'error.mp3';
	}
	return track;
};
