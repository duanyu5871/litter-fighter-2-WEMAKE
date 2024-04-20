export function match_all(text: string, regexp: RegExp): RegExpExecArray[];
export function match_all(text: string, regexp: RegExp, func: (result: RegExpExecArray) => void): void;
export function match_all(text: string, regexp: RegExp, func?: (result: RegExpExecArray) => void): RegExpExecArray[] | void {
  let result: RegExpExecArray | null = null;
  const results: RegExpExecArray[] = [];
  // eslint-disable-next-line no-cond-assign
  while (result = regexp.exec(text))
    func ? func(result) : results.push(result);
  if (!func) return results;
}