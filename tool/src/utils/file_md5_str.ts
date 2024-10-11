import { createHash } from 'crypto';
import fs from 'fs/promises';

/**
 * 读取文件的md5值
 *
 * @export
 * @async
 * @param {string} path 文件目录
 * @returns {Promise<string>} 文件内容的MD5值
 */
export async function file_md5_str(path: string): Promise<string> {
  const buf = await fs.readFile(path);
  return createHash('md5').update(buf).digest().toString('hex');
}
