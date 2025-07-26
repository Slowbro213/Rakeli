
const history: string[] = [];

let curr: number = 0;


export const historyLog = (input: string) => {
  if(history[history.length-1] === input)
    return;
  history.push(input);
  curr = history.length;
}


export const historyGetPrev = (): string | undefined => {
  curr--;
  if(curr < 0)
    curr=0;
  return history[curr];
}


export const historyGetNext = (): string | undefined => {
  curr++;
  if (curr > history.length) {
    curr--;
    return undefined;
  }
  return history[curr];
}


export const historyGet = (): string[] => {
  return history;
}
