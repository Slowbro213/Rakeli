import { stdout } from "@rakeli/stdout"
import { historyGet } from "@rakeli/history"
import type { Command } from "../types"

export const history: Command = {
  name: "history",
  exec: () => {
    stdout(historyGet())
    return 0;
  }
}
