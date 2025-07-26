import { stdout } from "@rakeli/stdout";
import type { Command } from "../types";


export const slowking: Command = {
  name: "slowking",
  exec: () => {
    stdout("Thats Me!");
    return 0;
  }
}
