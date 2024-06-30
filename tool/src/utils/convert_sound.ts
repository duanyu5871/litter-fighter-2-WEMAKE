import command_exists from 'command-exists';
import fs from 'fs/promises';
import { steps } from '..';
import { exec_cmd } from '../exec_cmd';

export async function convert_sound(out_dir: string, src_dir: string, src_path: string) {
  if (!steps.sound) return;
  const dst_path = src_path.replace(src_dir, out_dir).replace(/(.wma|.wav)$/, '.ogg');
  console.log('convert', src_path, '=>', dst_path);
  await fs.rm(dst_path, { recursive: true, force: true }).catch(() => void 0);

  if (!command_exists.sync('ffmpeg'))
    throw new Error("ffmpeg not found, download it from: https://ffmpeg.org/download.html");
  
  const args = ['-i', src_path, '-codec:a', 'libvorbis', '-b:a', '64k', '-ar', '44100', dst_path];
  return await exec_cmd('ffmpeg', ...args)
}
