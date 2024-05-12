export default function find_in_set<T>(set: Iterable<T>, p: (v: T) => unknown): T | undefined {
  for (const i of set) if (p(i)) return i;
}
