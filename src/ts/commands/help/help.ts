import type { Command } from "@rakeli/commands/types";


export const help: Command = {
  name: "help",
  exec: (argv: string[]) => {
    console.log("Helped" , argv[1]);
    return 0;
  }
}
