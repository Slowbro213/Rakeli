import { terminalBody, terminalInputRow, terminalInput } from "@rakeli/terminal"

export const newPrompt = () => {
  terminalBody.removeChild(terminalInputRow);
  terminalBody.appendChild(terminalInputRow);
  terminalInput.focus();
}
