export type ReturnCode = 
  | 0                      // Success
  | 1                      // General error
  | 2                      // Misuse of shell builtins
  | 126                    // Command cannot execute
  | 127                    // Command not found
  | 128                    // Invalid exit argument
  | 130                    // Terminated by Ctrl+C (SIGINT)
  | 137                    // SIGKILL
  | 143                    // SIGTERM
  | 255                    // Exit status out of range
  | `128+${SignalNumber}`  // Signal-based exits (template literal type)
  | number                 // Fallback for other custom codes (3-125, 129-254)
;

export type SignalNumber = 
  | 1    // SIGHUP
  | 2    // SIGINT
  | 3    // SIGQUIT
  | 6    // SIGABRT
  | 9    // SIGKILL
  | 15   // SIGTERM
;


export type CommandName = 
  | "help"
  | "echo"
  | "ls"
  | "cd"
  | "slowking"
  | "clear"
  | "whoami"
  | "pwd"
  | "history"
;

export type Command = {
  name: CommandName;
  exec: (argv: string[] | undefined) => ReturnCode
}
