import { spawn } from 'child_process';
import command_exists from 'command-exists';
import fs, { readFile } from 'fs/promises';
import path from 'path';
import dat_to_json from '../../src/LF2/dat_translator/dat_2_json';
import { read_indexes } from '../../src/LF2/dat_translator/read_indexes';
import { ICharacterData, IDataLists, IEntityPictureInfo } from '../../src/LF2/defines';
import { exec_cmd } from './exec_cmd';
import { check_is_str_ok } from './private/check_is_str_ok';
import { read_lf2_dat_file } from './read_old_lf2_dat_file';
import { classify } from './utils/classify';
import { convert_dat_file } from './utils/convert_dat_file';
import { convert_data_txt } from './utils/convert_data_txt';
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

async function parse_under_dir(src_dir_path: string, dst_dir_path: string, indexes: IDataLists | undefined) {
  if (steps.del_old) await fs.rmdir(dst_dir_path, { recursive: true }).catch(_ => void 0)
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
      if (!steps.dat) continue;
      const text = await read_lf2_dat_file(src_path);
      const index =
        indexes?.objects.find(v => src_path.endsWith(v.file)) ||
        indexes?.backgrounds.find(v => src_path.endsWith(v.file))
      const json = dat_to_json(text, index);
      {
        let dirty = json as Partial<ICharacterData>
        if (dirty?.frames?.[3]?.opoint) delete dirty.frames[3].opoint
      }
      if (!json) {
        console.log('copy', src_path, '=>', dst_path)
        await fs.copyFile(src_path, dst_path);
        continue;
      }

      console.log('convert', src_path, '=>', dst_path)
      await fs.writeFile(
        dst_path.replace(/\.dat$/, '.json'),
        JSON.stringify(json, null, 2)
      )

    } else if (filename.endsWith('.wma') || filename.endsWith('.wav')) {
      if (!steps.sound) continue;
      const _dst_path = dst_path + '.ogg'
      const dst_stat = await fs.stat(_dst_path).catch(e => void 0);
      if (dst_stat?.isFile() || dst_stat?.isDirectory())
        await fs.rm(_dst_path, { recursive: true, force: true })
      const args = ['-i', src_path, '-codec:a', 'libvorbis', '-b:a', '64k', '-ar', '44100', _dst_path];

      if (!command_exists.sync('ffmpeg'))
        throw new Error("ffmpeg not found, download it from: https://ffmpeg.org/download.html")

      await new Promise((resolve, reject) => {
        console.log('convert', src_path, '=>', _dst_path)
        const temp = spawn('ffmpeg', args).on('exit', resolve).on('error', reject)
        temp.stderr.on('data', d => console.error(filename, 'stderr: ' + d));
      })
    } else if (filename.endsWith('.bmp')) {
      if (!steps.bmp) continue;
      const _dst_path = dst_path.replace(/.bmp$/, '.png');
      const dst_stat = await fs.stat(_dst_path).catch(e => void 0);
      if (dst_stat?.isFile() || dst_stat?.isDirectory())
        await fs.rm(_dst_path, { recursive: true, force: true })
      const args = [src_path,
        "-alpha",
        "set",
        "-fuzz", "0%",
        "-fill", "rgba(0,0,0,0)",
        "-opaque", "rgb(0,0,0)",
        _dst_path
      ];

      if (!command_exists.sync('magick'))
        throw new Error("magick not found, download it from: https://imagemagick.org/script/download.php")

      await new Promise((resolve, reject) => {
        console.log('convert', src_path, '=>', _dst_path)
        const temp = spawn('magick', args).on('exit', resolve).on('error', reject)
        temp.stderr.on('data', d => console.error(filename, 'stderr: ' + d));
      })
    } else if (steps.others) {
      console.log('copy', src_path, '=>', dst_path)
      await fs.copyFile(src_path, dst_path);
    }
  }
}
async function main() {
  const {
    RAW_LF2_PATH, OUT_DIR,
    DATA_DIR_PATH, DATA_ZIP_NAME,
    PREL_DIR_PATH, PREL_ZIP_NAME,
  } = await readFile('./converter.config.json').then(buf => JSON.parse(buf.toString()))

  check_is_str_ok(
    RAW_LF2_PATH, OUT_DIR,
    DATA_DIR_PATH, DATA_ZIP_NAME,
    PREL_DIR_PATH, PREL_ZIP_NAME,
  )

  if (steps.converting) {
    const indexes = await read_indexes(`${RAW_LF2_PATH}/data/data.txt`);
    await fs.rm(DATA_DIR_PATH, { recursive: true, force: true })
    await parse_under_dir(RAW_LF2_PATH, DATA_DIR_PATH, indexes);
    await fs.writeFile(`${DATA_DIR_PATH}/data/data.json`, JSON.stringify(indexes, null, 2).replace(/\.dat"/g, ".json\""));
  }
  if (steps.zipping) {
    await make_zip_and_json(DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME);
    if (steps.cleanup) await fs.rm(DATA_DIR_PATH, { recursive: true, force: true })
  }
  await make_zip_and_json(PREL_DIR_PATH, OUT_DIR, PREL_ZIP_NAME);
}

// main();

async function main2() {
  const { RAW_LF2_PATH, DATA_DIR_PATH } = await readFile('./converter.config.json').then(buf => JSON.parse(buf.toString()))

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
  // console.log(Array.from(pic_list_map.keys()))
  for (const src_path of ress.file.bmp)
    await convert_pic(DATA_DIR_PATH, RAW_LF2_PATH, src_path, pic_list_map)
  for (const src_path of ress.file.png)
    await convert_pic(DATA_DIR_PATH, RAW_LF2_PATH, src_path, pic_list_map)
  // for (const src_path of ress.file.wav) // .wav
  //   await convert_sound(DATA_DIR_PATH, RAW_LF2_PATH, src_path);
  // for (const src_path of ress.file.wma) // .wma
  //   await convert_sound(DATA_DIR_PATH, RAW_LF2_PATH, src_path);
  // for (const src_path of ress.unknown) {
  //   const dst_path = src_path.replace(RAW_LF2_PATH, DATA_DIR_PATH)
  //   console.log('copy', src_path, '=>', dst_path)
  //   await fs.copyFile(src_path, dst_path)
  // }
}
main2()

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
      "-stroke", "rgba(0,0,0)",
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