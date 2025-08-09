import type { DraggableElement } from './types';

const draggableElements: DraggableElement[] = [];

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

export const makeDraggable = (e: HTMLElement) => {
	const element: DraggableElement = {
		value: e,
		isDragging: false,
		isResizing: false,
		startX: 0,
		startY: 0,
		startLeft: 0,
		startTop: 0,
	};

	element.value.onmousedown = (event: MouseEvent) => {
		if (element.isResizing) return;
		startDrag(event, element);
	};

	element.value.ontouchstart = (event: TouchEvent) => {
		if (element.isResizing) return;
		startDrag(event, element);
	};

	element.value.addEventListener('mousedown', (e) => {
		const rect = element.value.getBoundingClientRect();
		const resizeAreaSize = 20;
		const inResizeArea =
			e.pageX > rect.right - resizeAreaSize &&
			e.pageY > rect.bottom - resizeAreaSize;

		if (inResizeArea) {
			element.isResizing = true;
		}
	});

	draggableElements.push(element);
};

function startDrag(event: MouseEvent | TouchEvent, element: DraggableElement) {
	const { clientX, clientY } = getClientPosition(event);
	if (!clientX || !clientY) return;

	element.isDragging = true;
	element.startX = clientX; // pageX
	element.startY = clientY; // pageY
	element.startLeft = parseInt(element.value.style.left || '0', 10);
	element.startTop = parseInt(element.value.style.top || '0', 10);

	element.value.style.cursor = 'grabbing';
	element.value.style.userSelect = 'none';
}

export const initDraggableElements = () => {
	draggableElements.forEach((element) => {
		document.addEventListener('mousemove', (event: MouseEvent) => {
			if (element.isResizing || !element.isDragging) return;

			const x = element.startLeft + (event.pageX - element.startX);
			const y = element.startTop + (event.pageY - element.startY);

			element.value.style.left = `${x}px`;
			element.value.style.top = `${y}px`;
		});

		document.addEventListener(
			'touchmove',
			(event: TouchEvent) => {
				if (element.isResizing || !element.isDragging) return;

				const touch = event.touches[0];
				if (!touch) return;

				const x = element.startLeft + (touch.pageX - element.startX);
				const y = element.startTop + (touch.pageY - element.startY);

				element.value.style.left = `${x}px`;
				element.value.style.top = `${y}px`;
			},
			{ passive: false },
		);

		document.addEventListener('mouseup', () => {
			element.isDragging = false;
			element.isResizing = false;
			element.value.style.cursor = '';
			element.value.style.userSelect = '';
			document.body.style.userSelect = '';
		});

		document.addEventListener('touchend', () => {
			element.isDragging = false;
			element.isResizing = false;
			element.value.style.cursor = '';
			element.value.style.userSelect = '';
			document.body.style.userSelect = '';
		});
	});
};
