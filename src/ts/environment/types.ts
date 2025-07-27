import type { ReturnCode } from '@rakeli/commands';

export type StateKey = 'PATH' | 'HOME' | 'WORKING_DIR' | 'EXIT_CODE';

export type StateValue = string | ReturnCode;
