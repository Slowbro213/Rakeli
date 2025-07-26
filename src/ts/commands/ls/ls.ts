import { stdout } from "@rakeli/stdout";
import type { Command } from "../types";


export const ls: Command = {
  name: "ls",
  exec: (argv: string[]) => {

    const pages: string[] = [
      "Pages on this Website:",
      "About_Me",
      "Writeups",
      "Projects",
      "Home",
    ]

    stdout(pages);
    return 0;
  }
}
