import { spawn } from 'child_process';
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
    if (!stat.isFile()) continue;

    if (filename.endsWith('.exe')) {
      console.log('ignored:', filename)
      continue;
    }
    if (filename.endsWith('.dat')) {
      const buff = await read_lf2_dat_file(src_path);
      const index =
        indexes?.objects.find(v => src_path.endsWith(v.file)) ||
        indexes?.backgrounds.find(v => src_path.endsWith(v.file))
      const text = buff.toString().replace(/\\/g, '/').replace(/\r/g, '')

      const json = dat_to_json(text, index);
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

    } else if (filename.endsWith('.wma') || filename.endsWith('.wav')) {
      const _dst_path = dst_path + '.ogg'
      const dst_stat = await fs.stat(_dst_path).catch(e => void 0);
      if (dst_stat?.isFile() || dst_stat?.isDirectory())
        await fs.rm(_dst_path, { recursive: true, force: true })

      const args = ['-i', src_path, '-codec:a', 'libvorbis', '-b:a', '64k', _dst_path];
      await new Promise((a, b) => {
        console.log('convert', src_path, '=>', _dst_path)
        spawn('./ffmpeg', args).on('exit', a).on('error', b)
      })
    } else {
      await fs.copyFile(src_path, dst_path);
    }
  }
}

async function main() {
  const indexes = await parse_indexes('./LittleFighter/data/data.txt');
  await parse_under_dir('./LittleFighter', '../src/lf2_data', indexes);
  await fs.writeFile('../src/lf2_data/data/data.json', JSON.stringify(indexes, null, 2).replace(/\.dat"/g, ".json\""))

  await copy_dir("./src/js_utils", "../src/js_utils");
}

main()


