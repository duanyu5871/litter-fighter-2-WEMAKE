import { zip } from 'compressing';
import fs from 'fs/promises';
import path from 'path';
import { file_md5_str } from './file_md5_str';
import { is_dir } from './is_dir';
import { write_file } from './write_file';

export interface ZipFileInfo {
  url: string;
  md5: string;
}
/**
 * 压缩源目录，生成zip文件与“信息json文件”
 *
 * 源目录本身会被忽略
 * 
 * 会产生以下两个文件: 
 * 
 *    ${out_dir}/${zip_name}
 * 
 *    ${out_dir}/${zip_name}.json
 * 
 * @see {ZipFileInfo} 信息json文件的结构可见ZipFileInfo
 * @export
 * @async
 * @param {string} src_dir 源目录
 * @param {string} out_dir 输出目录
 * @param {string} zip_name 压缩文件名，需要包括后缀
 * @returns {Promise<void>}
 */
export async function make_zip_and_json(src_dir: string, out_dir: string, zip_name: string): Promise<void> {
  console.log('zipping', src_dir, '=>', path.join(out_dir, zip_name));
  if (!await is_dir(src_dir)) throw new Error('[make_zip_and_json] src_dir ' + src_dir + '不是目录');
  if (!await is_dir(out_dir)) throw new Error('[make_zip_and_json] out_dir ' + out_dir + '不是目录');

  const zip_path = path.join(out_dir, zip_name);
  const inf_path = path.join(out_dir, zip_name + '.json');

  await fs.unlink(zip_path).catch(() => { });
  await zip.compressDir(src_dir, zip_path, { ignoreBase: true });

  const inf: ZipFileInfo = { url: zip_name, md5: await file_md5_str(zip_path) }
  await write_file(inf_path, JSON.stringify(inf));
}
