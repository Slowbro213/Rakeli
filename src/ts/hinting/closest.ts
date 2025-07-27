import { commands, type Command, type CommandName } from '@rakeli/commands';
import { levenshtein } from '@rakeli/utils/levenshtein';

export const closestCommand = (command: string): string | undefined => {
  const currClosest: {
    name?: CommandName;
    distance?: number;
  } = {};
  commands.forEach((comm: Command) => {
    const dist = levenshtein(command, comm.name);

    if (
      !currClosest.name ||
      !currClosest.distance ||
      currClosest.distance > dist
    ) {
      currClosest.name = comm.name;
      currClosest.distance = dist;
    }

    return;
  });

  return currClosest.name;
};
