import fs from "fs/promises";
export interface ClassifyResult {
  directories: string[];
  unknown: string[];
  file: {
    dat: string[];
    wma: string[];
    wav: string[];
    png: string[];
    bmp: string[];
    lfr: string[];
    exe: string[];
  };
}
const get_default_result = (): ClassifyResult => ({
  directories: [],
  unknown: [],
  file: {
    dat: [],
    wma: [],
    wav: [],
    png: [],
    bmp: [],
    lfr: [],
    exe: [],
  },
});
const known_extensions = Object.keys(
  get_default_result().file,
) as (keyof ClassifyResult["file"])[];

export async function classify(
  cur_dir_path: string,
  result?: ClassifyResult,
): Promise<ClassifyResult> {
  result = result ?? get_default_result();
  for (const name of await fs.readdir(cur_dir_path)) {
    const sub_path = cur_dir_path + "/" + name;
    const stat = await fs.stat(sub_path);
    if (stat.isFile()) {
      let known = false;
      for (const key of known_extensions) {
        if (name.endsWith("." + key)) {
          result.file[key].push(sub_path);
          known = true;
          break;
        }
      }
      if (!known) {
        result.unknown.push(sub_path);
      }
      continue;
    }
    if (stat.isDirectory()) {
      result.directories.push(sub_path);
      await classify(sub_path, result);
      continue;
    }
  }
  return result;
}
