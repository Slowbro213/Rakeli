import { terminalBody } from "@rakeli/terminal"
import type { Command } from "../types";


export const clear: Command = {
  name: "clear",
  exec: (argv: string[] | undefined) => {
    if (!terminalBody || !argv) return 0;
    const len = 3 + ( argv[0] === "shortcut" ? 0 : 1);
    while (terminalBody.children.length > len){
      const child = terminalBody.children[2];
      if(!child) break;
      terminalBody?.removeChild(child);
    }
    return 0;
  }
}
