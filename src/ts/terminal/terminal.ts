import { makeDraggable } from '@rakeli/drag';
import {
	terminalBtnClose,
	terminalInput,
	terminalTrigger,
	terminalWindow,
	autocomplete,
} from './terminalParts';

import { stdout } from '@rakeli/stdout';
import {
	addSuggestion,
	autocompleteCommand,
	findCommand,
} from '@rakeli/hinting';
import { newPrompt } from '@rakeli/prompt';
import { clear } from '@rakeli/commands/clear';
import { historyGetNext, historyGetPrev, historyLog } from '@rakeli/history';
import { closestCommand } from '@rakeli/hinting/closest';
import { SHELL_STATE } from '@rakeli/environment';

// Add a keydown event listener
terminalInput.addEventListener('keydown', (event: KeyboardEvent) => {
	if (event.ctrlKey && event.key.toLowerCase() === 'l') {
		event.preventDefault();
		clear.exec(['shortcut']);
		return;
	}

	switch (event.key) {
		case 'Enter': {
			const input = terminalInput.value;
			const args = input.split(' ');
			if (!input || !args || !args[0]) {
				stdout('No detectable input ;-;');
				newPrompt();
				terminalInput.value = '';
				break;
			}
			const com = findCommand(args[0]);

			stdout('> ' + input);
			historyLog(input);
			addSuggestion(input);

			if (!com) {
				const possibleCommand = closestCommand(args[0]);
				if (!possibleCommand) stdout("Command doesn't exist :(");
				else stdout(["Command doesn't exist, did you mean:", possibleCommand]);
				newPrompt();
				terminalInput.value = '';
				break;
			}

			SHELL_STATE.set('EXIT_CODE', com.exec(args));

			newPrompt();

			terminalInput.value = '';
			break;
		}
		case 'ArrowRight': {
			const suggestion = autocomplete.textContent?.trim();
			if (suggestion && suggestion.startsWith(terminalInput.value)) {
				terminalInput.value = suggestion;
				autocomplete.innerHTML = '';
			}
			break;
		}
		case 'ArrowUp': {
			event.preventDefault();
			const pastInput = historyGetPrev();
			autocomplete.innerHTML = '';
			if (!pastInput) break;

			terminalInput.value = pastInput;
			terminalInput.setSelectionRange(pastInput.length, pastInput.length);

			break;
		}
		case 'ArrowDown': {
			const pastInput = historyGetNext();
			autocomplete.innerHTML = '';
			if (!pastInput) {
				terminalInput.value = '';
				break;
			}

			terminalInput.value = pastInput;
			terminalInput.setSelectionRange(pastInput.length, pastInput.length);

			break;
		}
		default: {
			const userInput = terminalInput.value + event.key;

			const hints = autocompleteCommand(userInput);

			if (hints.length === 0 || !hints[0]) {
				autocomplete.innerHTML = '';
				break;
			}

			const hintName = hints[0];

			autocomplete.innerHTML = hintName;

			break;
		}
	}
});

document.addEventListener('keydown', (event: KeyboardEvent) => {
	if (event.ctrlKey && event.key && event.key.toLowerCase() === 'n') {
		event.preventDefault();
		openTerminal();
	}
});

const closeTerminal = () => {
	terminalWindow.classList.remove('open');
	terminalWindow.classList.add('close');
	open = false;
};

terminalBtnClose.onclick = closeTerminal;

const openTerminal = () => {
	terminalWindow.classList.remove('hidden');
	terminalWindow.classList.remove('close');
	terminalWindow.classList.add('open');
	open = true;
};

let open = false;
terminalTrigger.onclick = () => {
	if (open) closeTerminal();
	else openTerminal();
};

makeDraggable(terminalWindow);
