import { terminalBody } from "@rakeli/terminal"
import type { Command } from "../types";


export const clear: Command = {
  name: "clear",
  exec: (argv: string[]) => {
    if(!terminalBody) return 0;
    for (let i = terminalBody.children.length - 2; i >= 2; i--) {
      terminalBody.children[i]?.remove();
    }
    return 0;
  }
}
