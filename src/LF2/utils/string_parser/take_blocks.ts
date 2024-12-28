import { match_all } from "./match_all";

export function take_blocks(
  text: string,
  start: string,
  end: string,
  f?: (remains: string) => void,
): string[] {
  const regexp = new RegExp(`${start.trim()}((.|\\n)+?)${end.trim()}`, "g");
  if (!f) return match_all(text, regexp).map((v) => v[1]);

  const positions: [number, number][] = [];
  const ret = match_all(text, regexp).map((v) => {
    positions.push([v.index, v.index + v[0].length]);
    return v[1];
  });
  if (positions.length) {
    let remains = "";
    let start = 0;
    for (const [from, to] of positions) {
      remains += text.substring(start, from);
      start = to;
    }
    remains += text.substring(start);
    f(remains);
  } else {
    f(text);
  }
  return ret;
}
