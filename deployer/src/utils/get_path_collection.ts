import { lstatSync, readdirSync } from 'fs';

export function get_path_collection(
  local_path: string,
  handle_dir_path: (v: string) => string = v => v,
  handle_file_path: (v: string) => string = v => v,
): {
  dir: Set<string>,
  file: Set<string>,
  size: number,
} {
  const ret = {
    dir: new Set<string>(),
    file: new Set<string>(),
    size: 0,
  };
  for (const name of readdirSync(local_path)) {
    const sub_path = local_path + '/' + name;
    const stat = lstatSync(sub_path);
    if (stat.isFile()) {
      ret.size += stat.size;
      ret.file.add(handle_file_path(sub_path));
      continue;
    }
    if (stat.isDirectory()) {
      ret.dir.add(handle_dir_path(sub_path));
      const sub = get_path_collection(sub_path, handle_dir_path, handle_file_path);
      for (const aa of sub.dir) ret.dir.add(aa);
      for (const bb of sub.file) ret.file.add(bb);
      ret.size += sub.size
    }
  }
  return ret;
}
