import fs from 'fs/promises';
import path from 'path';
import dat_to_json from './js_utils/lf2_dat_translator/dat_2_json';
import { read_indexes } from './js_utils/lf2_dat_translator/read_indexes';
import { ICharacterData, IDataLists } from './js_utils/lf2_type';
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
    const src_path = path.join(src_dir_path, filename).replace(/\\/g, '/')
    const stat = await fs.stat(src_path);
    const dst_path = path.join(dst_dir_path, filename).replace(/\\/g, '/')
    if (stat.isDirectory()) {
      await parse_under_dir(src_path, dst_path, indexes)
      continue;
    }
    if (stat.isFile() && filename.endsWith('.dat')) {
      const buff = await read_lf2_dat_file(src_path);
      const index =
        indexes?.objects.find(v => src_path.endsWith(v.file)) ||
        indexes?.backgrounds.find(v => src_path.endsWith(v.file))
      console.log(src_path, index)
      const json = dat_to_json(buff.toString().replace(/\\/g, '/').replace(/\r/g, ''), index);
      {
        let dirty = json as Partial<ICharacterData>
        if (dirty?.frames?.[3]?.opoint) delete dirty.frames[3].opoint
      }
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
  await fs.writeFile('./json/data/data.json', JSON.stringify(indexes, null, 2).replace(/\.dat"/g, ".json\""))
  await copy_dir("./json", "../src/G");
  await copy_dir("./src/js_utils", "../src/js_utils");
}

main()


