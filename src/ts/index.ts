import { stdout } from "@rakeli/stdout";
import { autocompleteCommand, findCommand } from "./hinting";
import { newPrompt } from "./prompt";
import { terminalInput, autocomplete } from "./terminal";
import { clear } from "./commands/clear";

// Get the input element (cast as HTMLInputElement for type safety)

// Add a keydown event listener
terminalInput.addEventListener("keydown", (event: KeyboardEvent) => {

  if (event.ctrlKey && event.key.toLowerCase() === "l") {
    event.preventDefault();
    clear.exec([""]);
    return;
  }

  switch (event.key) {
    case "Enter": {

      const input = terminalInput.value;
      const args = input.split(" ");
      if (!input || !args || !args[0]) {
        stdout("No detectable input ;-;");
        newPrompt();
        terminalInput.value = "";
        break;
      }
      const com = findCommand(args[0]);

      if (!com) {
        stdout("Command doesn't exist (yet) :(");
        newPrompt();
        terminalInput.value = "";
        break;
      }

      stdout("> " + input);

      com.exec(args);

      newPrompt();

      terminalInput.value = "";
      break;
    }
    case "ArrowRight": {
      const suggestion = autocomplete.textContent?.trim();
      if (suggestion && suggestion.startsWith(terminalInput.value)) {
        terminalInput.value = suggestion;
        autocomplete.innerHTML = "";
      }
      break;
    }
    default: {
      const userInput = terminalInput.value;

      const hints = autocompleteCommand(userInput);

      if (hints.length === 0 || !hints[0] || !hints[0].name) {
        autocomplete.innerHTML = "";
        break;
      }

      const hintName = hints[0].name;

      autocomplete.innerHTML = (hintName);

      break;
    };
  }
});





