import type { Command } from "@rakeli/commands/types";
import { stdout } from "@rakeli/stdout";


export const echo: Command = {
  name: "echo",
  exec: (argv: string[] | undefined) => {

    if (!argv || argv.length < 2) return 1;

    const words = argv.slice(1).join(' ');
    stdout(words);

    return 0;
  }
}
