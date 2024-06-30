import { createHash } from 'crypto';
import fs from 'fs/promises';

export async function file_md5_str(path: string) {
  const buf = await fs.readFile(path);
  return createHash('md5').update(buf).digest().toString('hex');
}
