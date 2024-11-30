import { readFileSync } from 'fs';
import fs, { readFile } from 'fs/promises';
import path, { join } from 'path';
import { ColonValueReader } from '../../src/LF2/dat_translator/ColonValueReader';
import { IEntityPictureInfo } from '../../src/LF2/defines';
import { CacheInfos } from './utils/cache_infos';
import { check_is_str_ok } from './utils/check_is_str_ok';
import { classify } from './utils/classify';
import { convert_dat_file } from './utils/convert_dat_file';
import { convert_data_txt } from './utils/convert_data_txt';
import { convert_sound } from './utils/convert_sound';
import { make_zip_and_json } from './utils/make_zip_and_json';
import { read_lf2_dat_file } from './utils/read_lf2_dat_file';
import { write_file } from './utils/write_file';
import { convert_pic, convert_pic_2 } from './utils/convert_pic';
import { read_text_file } from './utils/read_text_file';
const {
  RAW_LF2_PATH, DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME, PREL_DIR_PATH, PREL_ZIP_NAME,
  TXT_LF2_PATH
} = JSON.parse(readFileSync('./converter.config.json').toString())

enum EntryEnum {
  MAIN = 1,
  HELP,
  DAT_2_TXT,
  MAKE_PREL_ZIP,
}
let entry = EntryEnum.MAIN;

for (let i = 2; i < process.argv.length; ++i) {
  switch (process.argv[i].toLowerCase()) {
    case '-h':
    case '--help':
      entry = EntryEnum.HELP;
      break;
    case '--make-prel-zip':
      entry = EntryEnum.MAKE_PREL_ZIP;
      break;
    case '--dat-2-txt':
      entry = EntryEnum.DAT_2_TXT
      break;
  }
}

async function make_prel_zip() {
  await make_zip_and_json(PREL_DIR_PATH, OUT_DIR, PREL_ZIP_NAME);
}

async function main() {
  check_is_str_ok(
    RAW_LF2_PATH,
    OUT_DIR,
    DATA_DIR_PATH,
    DATA_ZIP_NAME,
    PREL_DIR_PATH,
    PREL_ZIP_NAME,
  )
  const cache_infos = await CacheInfos.create(path.join(OUT_DIR, 'cache_infos.json'))
  const ress = await classify(RAW_LF2_PATH);
  for (const src_path of ress.directories) {
    const dst_path = src_path.replace(RAW_LF2_PATH, DATA_DIR_PATH)
    await fs.mkdir(dst_path, { recursive: true }).catch(_ => void 0)
  }

  const pic_list_map = new Map<string, IEntityPictureInfo[]>();
  const indexes = await convert_data_txt(RAW_LF2_PATH, DATA_DIR_PATH);
  if (indexes) {
    for (const src_path of ress.file.dat) {
      const dst_path = convert_dat_file.get_dst_path(DATA_DIR_PATH, RAW_LF2_PATH, src_path);
      const cache_info = await cache_infos.get_info(src_path, dst_path);
      const json = await convert_dat_file(DATA_DIR_PATH, src_path, dst_path, indexes);
      if (!Array.isArray(json) && json && 'is_game_obj_data' in json) {
        let edited = false
        for (const pic_name in json.base.files) {
          const file = json.base.files[pic_name];
          const key = file.path
          const arr = pic_list_map.get(key)
          if (arr) {
            file.path = file.path.replace(/.png$/, `_${arr.length}.png`);
            edited = true;
            arr.push(file);
          } else {
            pic_list_map.set(key, [file])
          }
        }
        if (edited) {
          await write_file(dst_path, JSON.stringify(json, null, 2))
        }
      }
      await cache_info.update()
    }
  }
  const imgs = [...ress.file.bmp, ...ress.file.png]
  for (const src_path of imgs) {
    const dst_path = convert_pic.get_dst_path(DATA_DIR_PATH, RAW_LF2_PATH, src_path)
    const pic_list = pic_list_map.get(dst_path.replace(DATA_DIR_PATH + '/', ''))
    if (!pic_list?.length) {
      const cache_info = await cache_infos.get_info(src_path, dst_path);
      const is_changed = await cache_info.is_changed()
      if (!is_changed) {
        console.log('not changed:', src_path, '=>', dst_path);
        continue;
      }
      await convert_pic(DATA_DIR_PATH, RAW_LF2_PATH, src_path)
      await cache_info.update()
    } else {
      for (const pic of pic_list) {
        const dst_path = convert_pic_2.get_dst_path(DATA_DIR_PATH, pic)
        const cache_info = await cache_infos.get_info(src_path, dst_path);
        const is_changed = await cache_info.is_changed()
        if (!is_changed) {
          console.log('not changed:', src_path, '=>', dst_path);
          continue;
        }
        await convert_pic_2(dst_path, src_path, pic)
        await cache_info.update()
      }
    }
  }

  const sounds = [...ress.file.wav, ...ress.file.wma]
  for (const src_path of sounds) {
    const dst_path = convert_sound.get_dst_path(DATA_DIR_PATH, RAW_LF2_PATH, src_path)
    const cache_info = await cache_infos.get_info(src_path, dst_path);
    const is_changed = await cache_info.is_changed()
    if (!is_changed) {
      console.log('not changed:', src_path, '=>', dst_path);
      continue;
    }
    await convert_sound(dst_path, src_path);
    await cache_info.update();
  }

  for (const src_path of ress.unknown) {
    const dst_path = src_path.replace(RAW_LF2_PATH, DATA_DIR_PATH)
    const cache_info = await cache_infos.get_info(src_path, dst_path);
    const is_changed = await cache_info.is_changed()
    if (!is_changed) {
      console.log('not changed:', src_path, '=>', dst_path);
      continue;
    }
    console.log('copy', src_path, '=>', dst_path)
    await fs.copyFile(src_path, dst_path)
    await cache_info.update();
  }
  await cache_infos.save()
  await make_zip_and_json(DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME);
  await make_prel_zip()
}

async function DAT_2_TXT() {
  check_is_str_ok(
    RAW_LF2_PATH, TXT_LF2_PATH
  )
  try {
    await fs.rm(TXT_LF2_PATH, { recursive: true, force: true })
  } catch {

  }
  async function a(path: string, t_path: string) {
    try {
      await fs.mkdir(t_path, { recursive: true })
    } catch {
    }
    const items = await fs.readdir(path)
    for (const item of items) {
      const sub_path = join(path, item);
      let sub_t_path = join(t_path, item);
      const stat = await fs.stat(sub_path);
      if (stat.isDirectory()) {
        await a(sub_path, sub_t_path);
      } else if (stat.isFile()) {
        if (item.endsWith('.dat')) {
          sub_t_path = sub_t_path.replace(/.dat$/, '.txt')
          console.log('reading', sub_path, '=>', sub_t_path);
          const data = await read_lf2_dat_file(sub_path)
          await fs.writeFile(sub_t_path, data);
        } else {
          // await fs.copyFile(sub_path, sub_t_path)
        }
      }
    }
  }
  await a(RAW_LF2_PATH, TXT_LF2_PATH);

  async function test() {
    const src_str = await readFile(join(TXT_LF2_PATH, '/bg/sys/bc/bg.txt')).then(v => v.toString())
    const result = {
      name: '',
      width: 0,
      zboundary: [0, 0],
      shadow: '',
      shadowsize: [0, 0],
    }
    const [, rem_str] = new ColonValueReader<typeof result>()
      .str('name')
      .int('width')
      .int_2('zboundary')
      .str('shadow')
      .int_2('shadowsize')
      .read(src_str, result);
    console.log(src_str, '\n///////////////////////\n', rem_str)
  }
  await test()
}

switch (entry) {
  case EntryEnum.MAIN: main(); break;
  case EntryEnum.HELP: console.log("need_help"); break;
  case EntryEnum.DAT_2_TXT: DAT_2_TXT(); break;
  case EntryEnum.MAKE_PREL_ZIP: make_prel_zip(); break;
}

