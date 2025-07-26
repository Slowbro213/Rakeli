import { autocompleteCommand, findCommand } from "./hinting";

// Get the input element (cast as HTMLInputElement for type safety)
const terminalInput = document.getElementById("terminal-input") as HTMLInputElement;
const autocomplete = document.getElementById("autocomplete") as HTMLElement;

// Add a keydown event listener
terminalInput.addEventListener("keydown", (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter": {

      const input = terminalInput.value;
      const args = input.split(" ");
      if(!input || !args || !args[0]) {
        console.log(args[0]);
        break;
      }
      const com = findCommand(args[0]);

      if(!com)
        break;

      com.exec(args);

      terminalInput.value = "";
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





