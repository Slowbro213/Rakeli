import type { StateKey, StateValue } from './types';

export const SHELL_STATE = new Map<StateKey, StateValue>([
	['PATH', '/aswsome/binaries'],
	['HOME', '/Rakeli/Home'],
	['WORKING_DIR', '/Rakeli/Home'],
	['EXIT_CODE', 0],
]);
