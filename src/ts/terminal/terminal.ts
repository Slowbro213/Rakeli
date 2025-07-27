import { terminalInput, terminalWindow } from './terminalParts';

let isDragging = false;
let isResizing = false;
let offsetX = 0;
let offsetY = 0;

const getClientPosition = (event: MouseEvent | TouchEvent) => {
	if ('touches' in event) {
		return {
			clientX: event.touches[0]?.clientX,
			clientY: event.touches[0]?.clientY,
		};
	} else {
		return {
			clientX: (event as MouseEvent).clientX,
			clientY: (event as MouseEvent).clientY,
		};
	}
};

terminalWindow.addEventListener('mousedown', (e) => {
	terminalInput.focus();
	const rect = terminalWindow.getBoundingClientRect();
	const resizeAreaSize = 20;
	const inResizeArea =
		e.clientX > rect.right - resizeAreaSize &&
		e.clientY > rect.bottom - resizeAreaSize;

	if (inResizeArea) {
		isResizing = true;
	}
});

terminalWindow.onmousedown = (event: MouseEvent) => {
	if (isResizing) return;
	startDrag(event);
};

terminalWindow.ontouchstart = (event: TouchEvent) => {
	event.preventDefault();
	if (isResizing) return;
	startDrag(event);
};

function startDrag(event: MouseEvent | TouchEvent) {
	const { clientX, clientY } = getClientPosition(event);
	if (!clientX || !clientY) return;

	isDragging = true;
	const rect = terminalWindow.getBoundingClientRect();

	offsetX = clientX - rect.left;
	offsetY = clientY - rect.top;

	terminalWindow.style.cursor = 'grabbing';
	terminalWindow.style.userSelect = 'none';
	document.body.style.userSelect = 'none';
}

document.addEventListener('mousemove', (event: MouseEvent) => {
	if (isResizing) return;
	if (!isDragging) return;

	const x = event.clientX - offsetX;
	const y = event.clientY - offsetY;

	terminalWindow.style.left = `${x}px`;
	terminalWindow.style.top = `${y}px`;
});

document.addEventListener(
	'touchmove',
	(event: TouchEvent) => {
		event.preventDefault();
		if (isResizing) return;
		if (!isDragging) return;

		const touch = event.touches[0];
		if (!touch) return;

		const x = touch.clientX - offsetX;
		const y = touch.clientY - offsetY;

		terminalWindow.style.left = `${x}px`;
		terminalWindow.style.top = `${y}px`;
	},
	{ passive: false },
);

document.addEventListener('mouseup', () => {
	isDragging = false;
	isResizing = false;
	terminalWindow.style.cursor = '';
	terminalWindow.style.userSelect = '';
	document.body.style.userSelect = '';
});

document.addEventListener('touchend', () => {
	isDragging = false;
	isResizing = false;
	terminalWindow.style.cursor = '';
	terminalWindow.style.userSelect = '';
	document.body.style.userSelect = '';
});
