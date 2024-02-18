import fs from 'fs/promises';
import path from 'path';
import dat_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import { read_indexes } from './js_utils/lf2_dat_translator/read_indexes';
import { read_lf2_dat_file } from './read_old_lf2_dat_file';
import { copy_dir } from './utils/copy_dir';
import { read_text_file } from './utils/read_text_file';

async function parse_indexes(src_path: string): Promise<IDataLists | undefined> {
  const text = await read_text_file(src_path)
  return read_indexes(text);
}

async function parse_under_dir(src_dir_path: string, dst_dir_path: string, indexes: IDataLists | undefined) {
  await fs.mkdir(dst_dir_path, { recursive: true }).catch(_ => void 0)
  for (const filename of await fs.readdir(src_dir_path)) {
    const src_path = path.join(src_dir_path, filename)
    const stat = await fs.stat(src_path);
    const dst_path = path.join(dst_dir_path, filename)
    if (stat.isDirectory()) {
      await parse_under_dir(src_path, dst_path, indexes)
      continue;
    }
    if (stat.isFile() && filename.endsWith('.dat')) {
      const buff = await read_lf2_dat_file(src_path);
      const index = indexes?.objects.find(v => v.file.indexOf(filename) >= 0)
      const json = dat_to_json(buff.toString().replace(/\\/g, '/').replace(/\r/g, ''), index);
      if (!json) {
        await fs.copyFile(src_path, dst_path);
        continue;
      }
      await fs.writeFile(
        dst_path.replace(/\.dat$/, '.json'),
        JSON.stringify(json, null, 2)
      )
    } else {
      await fs.copyFile(src_path, dst_path);
    }
  }
}

async function main() {
  const indexes = await parse_indexes('./LittleFighter/data/data.txt');
  await parse_under_dir('./LittleFighter', './json', indexes);
  await copy_dir("./json", "../src/G");

  await copy_dir("./src/types", "../src/types");
  await copy_dir("./src/js_utils", "../src/js_utils");
}

main()


