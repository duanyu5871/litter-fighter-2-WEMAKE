import { lstatSync, readdirSync } from 'fs';

export function get_local_path_info(path: string): readonly [Set<string>, Set<string>] {
  const ret = [
    new Set<string>(),
    new Set<string>()
  ] as const;
  for (const name of readdirSync(path)) {
    const sub_path = path + '/' + name;
    const stat = lstatSync(sub_path);
    if (stat.isFile()) ret[1].add(sub_path);
    if (stat.isDirectory()) {
      ret[0].add(sub_path);
      const [a, b] = get_local_path_info(sub_path);
      for (const aa of a) ret[0].add(aa);
      for (const bb of b) ret[1].add(bb);
    }
  }
  return ret;
}
