import { terminalBody } from "@rakeli/terminal"
import type { Command } from "../types";


export const clear: Command = {
  name: "clear",
  exec: (argv: string[] | undefined) => {
    if (!terminalBody || !argv) return 0;
    const pos = 2;
    const len = pos + 1 + (argv[0] === "clear" ? 1 : 0);
    while (terminalBody.children.length > len) {
      const child = terminalBody.children[pos];
      if (!child) break;
      terminalBody?.removeChild(child);
    }
    return 0;
  }
}
