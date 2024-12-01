import { createHash } from 'crypto';
import fs from 'fs/promises';

/**
 * 读取文件的md5值
 *
 * @export
 * @async
 * @param {string} path 文件目录
 * @param {string} salt salt
 * @returns {Promise<string>} 文件内容的MD5值
 */
export async function file_md5_str(path: string, salt: string = ''): Promise<string> {
  const buf = await fs.readFile(path);
  return createHash('md5').update(buf).update(salt).digest().toString('hex');
}
