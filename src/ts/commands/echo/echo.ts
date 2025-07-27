import type { Command } from '@rakeli/commands/types';
import { SHELL_STATE } from '@rakeli/environment';
import type { StateKey } from '@rakeli/environment/types';
import { stdout } from '@rakeli/stdout';

export const echo: Command = {
  name: 'echo',
  exec: (argv: string[] | undefined) => {
    if (!argv || argv.length < 2) return 1;

    const words = argv.slice(1).join(' ');

    const firstWord = argv[1];

    switch (firstWord) {
      case '$?': {
        const exitCode = SHELL_STATE.get('EXIT_CODE');
        stdout(String(exitCode));
        return 0;
      }

      default: {
        if (firstWord?.startsWith('$')) {
          const envVar = firstWord.slice(1);
          const value = SHELL_STATE.get(envVar as StateKey);

          if (value !== undefined) {
            stdout(String(value));
            return 0;
          } else {
            stdout(`No such variable: ${envVar}`);
            return 1;
          }
        }
      }
    }

    stdout(words);

    return 0;
  },
};
