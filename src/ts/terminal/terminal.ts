import {
	terminalBtnClose,
	terminalInput,
	terminalTrigger,
	terminalWindow,
} from './terminalParts';

let isDragging = false;
let isResizing = false;
let startX = 0;
let startY = 0;
let startLeft = 0;
let startTop = 0;

const getClientPosition = (event: MouseEvent | TouchEvent) => {
	if ('touches' in event) {
		return {
			clientX: event.touches[0]?.pageX,
			clientY: event.touches[0]?.pageY,
		};
	} else {
		return {
			clientX: (event as MouseEvent).pageX,
			clientY: (event as MouseEvent).pageY,
		};
	}
};

terminalWindow.addEventListener('mousedown', (e) => {
	const rect = terminalWindow.getBoundingClientRect();
	const resizeAreaSize = 20;
	const inResizeArea =
		e.pageX > rect.right - resizeAreaSize &&
		e.pageY > rect.bottom - resizeAreaSize;

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
	startX = clientX; // pageX
	startY = clientY; // pageY
	startLeft = parseInt(terminalWindow.style.left || '0', 10);
	startTop = parseInt(terminalWindow.style.top || '0', 10);

	terminalWindow.style.cursor = 'grabbing';
	terminalWindow.style.userSelect = 'none';
	document.body.style.userSelect = 'none';
}

document.addEventListener('mousemove', (event: MouseEvent) => {
	if (isResizing || !isDragging) return;

	const x = startLeft + (event.pageX - startX);
	const y = startTop + (event.pageY - startY);

	terminalWindow.style.left = `${x}px`;
	terminalWindow.style.top = `${y}px`;
});

document.addEventListener(
	'touchmove',
	(event: TouchEvent) => {
		if (isResizing || !isDragging) return;

		const touch = event.touches[0];
		if (!touch) return;

		const x = startLeft + (touch.pageX - startX);
		const y = startTop + (touch.pageY - startY);

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

export const closeTerminal = () => {
	terminalWindow.classList.remove('open');
	terminalWindow.classList.add('close');
	open = false;
};

terminalBtnClose.onclick = closeTerminal;

export const openTerminal = () => {
	terminalWindow.classList.remove('hidden');
	terminalWindow.classList.remove('close');
	terminalWindow.classList.add('open');
	terminalInput.focus();
	open = true;
};

let open = false;
terminalTrigger.onclick = () => {
	if (open) closeTerminal();
	else openTerminal();
};
