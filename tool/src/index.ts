import { spawn } from 'child_process';
import command_exists from 'command-exists';
import { zip } from 'compressing';
import { createHash } from 'crypto';
import fs, { readFile } from 'fs/promises';
import path from 'path';
import dat_to_json from '../../src/LF2/dat_translator/dat_2_json';
import { read_indexes } from '../../src/LF2/dat_translator/read_indexes';
import { ICharacterData, IDataLists } from '../../src/LF2/defines';
import { read_lf2_dat_file } from './read_old_lf2_dat_file';
import { is_dir } from './utils/is_dir';
import { read_text_file } from './utils/read_text_file';

let steps = {
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
async function parse_indexes(src_path: string): Promise<IDataLists | undefined> {
  const text = await read_text_file(src_path)
  return read_indexes(text);
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
  
  check_str(
    RAW_LF2_PATH, OUT_DIR,
    DATA_DIR_PATH, DATA_ZIP_NAME,
    PREL_DIR_PATH, PREL_ZIP_NAME,
  )

  if (steps.converting) {
    const indexes = await parse_indexes(`${RAW_LF2_PATH}/data/data.txt`);
    await fs.rm(DATA_DIR_PATH, { recursive: true, force: true })
    await parse_under_dir(RAW_LF2_PATH, DATA_DIR_PATH, indexes);
    await fs.writeFile(`${DATA_DIR_PATH}/data/data.json`, JSON.stringify(indexes, null, 2).replace(/\.dat"/g, ".json\""));
  }
  if (steps.zipping) {
    await make_zip(DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME);
    if (steps.cleanup) await fs.rm(DATA_DIR_PATH, { recursive: true, force: true })
  }
  await make_zip(PREL_DIR_PATH, OUT_DIR, PREL_ZIP_NAME);
}


main();
async function make_zip(src_dir: string, out_dir: string, zip_name: string) {
  console.log('zipping', src_dir, '=>', path.join(out_dir, zip_name))
  if (!await is_dir(src_dir)) throw new Error(src_dir + '不是目录')
  if (!await is_dir(out_dir)) throw new Error(out_dir + '不是目录')

  const zip_path = path.join(out_dir, zip_name)
  const inf_path = path.join(out_dir, zip_name + '.json')

  await fs.unlink(zip_path).catch(() => { })
  await zip.compressDir(src_dir, zip_path, { ignoreBase: true })
  await write_file(inf_path, JSON.stringify({ url: zip_name, md5: await file_md5_str(zip_path) }))
}
async function file_md5_str(path: string) {
  const buf = await fs.readFile(path)
  return createHash('md5').update(buf).digest().toString('hex')
}
async function write_file(path: string, data: string) {
  await fs.unlink(path).catch(() => { })
  await fs.writeFile(path, data)
}
function check_str(...list: string[]) {
  for (const ele of list)
    if (typeof ele !== 'string')
      throw new Error(`未设置${ele}`)
}