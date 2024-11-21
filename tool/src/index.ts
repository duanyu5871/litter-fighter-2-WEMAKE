import fs, { readFile } from 'fs/promises';
import { IEntityPictureInfo } from '../../src/LF2/defines';
import { check_is_str_ok } from './utils/check_is_str_ok';
import { classify } from './utils/classify';
import { convert_dat_file } from './utils/convert_dat_file';
import { convert_data_txt } from './utils/convert_data_txt';
import { convert_sound } from './utils/convert_sound';
import { make_zip_and_json } from './utils/make_zip_and_json';
import { write_file } from './utils/write_file';
import { convert_pic } from './utils/convert_pic';
import { join } from 'path';
import { read_lf2_dat_file } from './utils/read_lf2_dat_file';
import { ColonValueReader } from '../../src/LF2/dat_translator/ColonValueReader';
import { readFileSync } from 'fs';
const {
  RAW_LF2_PATH, DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME, PREL_DIR_PATH, PREL_ZIP_NAME,
  TXT_LF2_PATH
} = JSON.parse(readFileSync('./converter.config.json').toString())

export let steps = {
  del_old: true,
  sound: true,
  dat: true,
  bmp: true,
  others: true,
  converting: true,
  zipping: true,
  cleanup: true,
};
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
    case '--no-cleanup':
      steps.cleanup = false
      break;
    case '--zipping-only':
      for (const k in steps) (steps as any)[k] = false;
      steps.zipping = true;
      break;
    case '--converting-only':
      for (const k in steps) (steps as any)[k] = false;
      steps.converting = steps.dat = steps.bmp = true;
      break;
    case '--dat-only':
      for (const k in steps) (steps as any)[k] = false;
      steps.converting = steps.dat = true;
      break;
    case '--bmp-only':
      for (const k in steps) (steps as any)[k] = false;
      steps.converting = steps.bmp = true;
      break;
  }
}

async function make_prel_zip() {
  await make_zip_and_json(PREL_DIR_PATH, OUT_DIR, PREL_ZIP_NAME);
}
async function main() {
  check_is_str_ok(
    RAW_LF2_PATH, OUT_DIR,
    DATA_DIR_PATH, DATA_ZIP_NAME,
    PREL_DIR_PATH, PREL_ZIP_NAME,
  )
  await fs.rm(DATA_DIR_PATH, { recursive: true, force: true })
  const ress = await classify(RAW_LF2_PATH);
  for (const src_path of ress.directories) {
    const dst_path = src_path.replace(RAW_LF2_PATH, DATA_DIR_PATH)
    await fs.mkdir(dst_path, { recursive: true }).catch(_ => void 0)
  }
  const pic_list_map = new Map<string, IEntityPictureInfo[]>();
  const indexes = await convert_data_txt(RAW_LF2_PATH, DATA_DIR_PATH);
  if (indexes) {
    for (const src_path of ress.file.dat) {
      const [json, dst_path] = await convert_dat_file(DATA_DIR_PATH, RAW_LF2_PATH, src_path, indexes)
      if (Array.isArray(json) || !json)
        continue;
      if ('is_game_obj_data' in json) {
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
          write_file(dst_path, JSON.stringify(json, null, 2))
        }
      }
    }
  }
  if (steps.bmp) {
    for (const src_path of ress.file.bmp)
      await convert_pic(DATA_DIR_PATH, RAW_LF2_PATH, src_path, pic_list_map)
    for (const src_path of ress.file.png)
      await convert_pic(DATA_DIR_PATH, RAW_LF2_PATH, src_path, pic_list_map)
  }
  if (steps.sound) {
    for (const src_path of ress.file.wav) // .wav
      await convert_sound(DATA_DIR_PATH, RAW_LF2_PATH, src_path);
    for (const src_path of ress.file.wma) // .wma
      await convert_sound(DATA_DIR_PATH, RAW_LF2_PATH, src_path);
  }
  for (const src_path of ress.unknown) {
    const dst_path = src_path.replace(RAW_LF2_PATH, DATA_DIR_PATH)
    console.log('copy', src_path, '=>', dst_path)
    await fs.copyFile(src_path, dst_path)
  }
  await make_zip_and_json(DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME);
  await fs.rm(DATA_DIR_PATH, { recursive: true, force: true })
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

