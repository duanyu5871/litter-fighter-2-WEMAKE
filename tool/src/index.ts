import command_exists from 'command-exists';
import fs, { readFile } from 'fs/promises';
import { IEntityPictureInfo } from '../../src/LF2/defines';
import { exec_cmd } from './exec_cmd';
import { check_is_str_ok } from './private/check_is_str_ok';
import { classify } from './utils/classify';
import { convert_dat_file } from './utils/convert_dat_file';
import { convert_data_txt } from './utils/convert_data_txt';
import { convert_sound } from './utils/convert_sound';
import { make_zip_and_json } from './utils/make_zip_and_json';
import { write_file } from './utils/write_file';

export let steps = {
  del_old: true,
  sound: true,
  dat: true,
  bmp: true,
  others: true,
  converting: true,
  zipping: true,
  cleanup: true
};

for (let i = 2; i < process.argv.length; ++i) {
  switch (process.argv[i]) {
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
async function main() {
  const {
    RAW_LF2_PATH, DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME, PREL_DIR_PATH, PREL_ZIP_NAME
  } = await readFile('./converter.config.json').then(buf => JSON.parse(buf.toString()))
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
  for (const src_path of ress.file.bmp)
    await convert_pic(DATA_DIR_PATH, RAW_LF2_PATH, src_path, pic_list_map)
  for (const src_path of ress.file.png)
    await convert_pic(DATA_DIR_PATH, RAW_LF2_PATH, src_path, pic_list_map)
  for (const src_path of ress.file.wav) // .wav
    await convert_sound(DATA_DIR_PATH, RAW_LF2_PATH, src_path);
  for (const src_path of ress.file.wma) // .wma
    await convert_sound(DATA_DIR_PATH, RAW_LF2_PATH, src_path);
  for (const src_path of ress.unknown) {
    const dst_path = src_path.replace(RAW_LF2_PATH, DATA_DIR_PATH)
    console.log('copy', src_path, '=>', dst_path)
    await fs.copyFile(src_path, dst_path)
  }
  await make_zip_and_json(DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME);
  await fs.rm(DATA_DIR_PATH, { recursive: true, force: true })
  await make_zip_and_json(PREL_DIR_PATH, OUT_DIR, PREL_ZIP_NAME);
}
main()

async function convert_pic(out_dir: string, src_dir: string, src_path: string, pic_list_map: Map<string, IEntityPictureInfo[]>) {
  if (!steps.bmp) return;
  const dst_path = src_path.replace(src_dir, out_dir).replace(/(.bmp)$/, '.png');

  await fs.rm(dst_path, { recursive: true, force: true }).catch(e => void 0);

  if (!command_exists.sync('magick'))
    throw new Error("magick not found, download it from: https://imagemagick.org/script/download.php")

  const pic_list = pic_list_map.get(dst_path.replace(out_dir + '/', ''))
  if (!pic_list?.length) {
    console.log('convert', src_path, '=>', dst_path)
    await exec_cmd('magick',
      src_path,
      "-alpha",
      "set",
      "-fill", "rgba(0,0,0,0)",
      "-opaque", "rgb(0,0,0)",
      'PNG32:' + dst_path
    )
    return;
  }
  for (const pic of pic_list) {
    const { col: row, row: col, cell_w, cell_h } = pic
    const w = (cell_w + 1) * col;
    const h = (cell_h + 1) * row;
    if (pic.path === 'sprite/template1/0.png') {
      console.log(w, h, col, row)
    }
    const dst_path = out_dir + '/' + pic.path;
    console.log('convert', src_path, '=>', dst_path)
    const remove_lines: string[] = [];
    for (let col_idx = 0; col_idx < col; ++col_idx) {
      const x = (cell_w + 1) * (col_idx + 1) - 1
      remove_lines.push('-draw', `line ${x},0 ${x},${h}`)
    }
    for (let row_idx = 0; row_idx < row; ++row_idx) {
      const y = (cell_h + 1) * (row_idx + 1) - 1
      remove_lines.push('-draw', `line 0,${y} ${w},${y}`)
    }

    const args = [
      src_path,
      "-stroke", "rgba(0,0,0,0)",
      "-strokewidth", "1",
      ...remove_lines,
      "-alpha",
      "set",
      "-fill", "rgba(0,0,0,0)",
      "-opaque", "rgb(0,0,0)",
      'PNG32:' + dst_path
    ]

    await exec_cmd('magick', ...args)
  }
}