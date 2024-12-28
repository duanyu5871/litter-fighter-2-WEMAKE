export function match_all(text: string, regexp: RegExp): RegExpExecArray[];
export function match_all(
  text: string,
  regexp: RegExp,
  func: (result: RegExpExecArray) => void,
): void;
export function match_all(
  text: string,
  regexp: RegExp,
  func?: (result: RegExpExecArray) => void,
): RegExpExecArray[] | void {
  regexp = new RegExp(regexp, "g");
  let result: RegExpExecArray | null = regexp.exec(text);
  const results: RegExpExecArray[] = [];
  while (result) {
    func ? func(result) : results.push(result);
    result = regexp.exec(text);
  }
  if (!func) return results;
}
