import { help } from "./help";
import type { Command } from "./types";

export * from "./types";
export * from "./help";


export const commands : Command[] = [help];
