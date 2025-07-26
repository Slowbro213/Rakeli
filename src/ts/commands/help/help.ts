import type { Command } from '@rakeli/commands/types';
import { stdout } from '@rakeli/stdout';

export const help: Command = {
  name: 'help',
  exec: () => {
    const coms = [
      'help',
      'ls',
      'cd ( doesnt work yet )',
      'slowking',
      'echo',
      'clear',
      'history',
    ];
    stdout(coms);
    return 0;
  },
};
