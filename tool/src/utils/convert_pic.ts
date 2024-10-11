import command_exists from 'command-exists';
import fs from 'fs/promises';
import type { IEntityPictureInfo } from '../../../src/LF2/defines';
import { exec_cmd } from "./exec_cmd";

export async function convert_pic(out_dir: string, src_dir: string, src_path: string, pic_list_map: Map<string, IEntityPictureInfo[]>) {
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
      'PNG8:' + dst_path
    )
    return;
  }

  for (const pic of pic_list) {
    const { col: row, row: col, cell_w, cell_h } = pic
    const w = (cell_w + 1) * col;
    const h = (cell_h + 1) * row;
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
      'PNG8:' + dst_path
    ]

    await exec_cmd('magick', ...args)
  }
}