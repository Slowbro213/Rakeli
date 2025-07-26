import { terminalBody } from "@rakeli/terminal";

export const stdout = (output: string | string[]) => {
  const lines = Array.isArray(output) ? output : [output];
  for (const line of lines) {
    const p = document.createElement("p");
    p.className = "terminal-line";
    p.textContent = `> ${line}`;
    terminalBody.appendChild(p);
  }
}
