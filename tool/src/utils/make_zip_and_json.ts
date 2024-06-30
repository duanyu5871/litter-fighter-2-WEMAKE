import { zip } from 'compressing';
import fs from 'fs/promises';
import path from 'path';
import { file_md5_str } from './file_md5_str';
import { is_dir } from './is_dir';
import { write_file } from './write_file';

export async function make_zip_and_json(src_dir: string, out_dir: string, zip_name: string) {
  console.log('zipping', src_dir, '=>', path.join(out_dir, zip_name));
  if (!await is_dir(src_dir)) throw new Error(src_dir + '不是目录');
  if (!await is_dir(out_dir)) throw new Error(out_dir + '不是目录');

  const zip_path = path.join(out_dir, zip_name);
  const inf_path = path.join(out_dir, zip_name + '.json');

  await fs.unlink(zip_path).catch(() => { });
  await zip.compressDir(src_dir, zip_path, { ignoreBase: true });
  await write_file(inf_path, JSON.stringify({ url: zip_name, md5: await file_md5_str(zip_path) }));
}
