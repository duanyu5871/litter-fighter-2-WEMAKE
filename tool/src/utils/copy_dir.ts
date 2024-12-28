import fs from "fs/promises";
import path from "path";

export async function copy_dir(src_dir_path: string, dst_dir_path: string) {
  const file_names = await fs.readdir(src_dir_path);
  await fs.mkdir(dst_dir_path).catch((_) => 0);
  for (const file_name of file_names) {
    const src_path = path.join(src_dir_path, file_name);
    const dst_path = path.join(dst_dir_path, file_name);
    const stat = await fs.stat(src_path);
    if (stat.isFile()) {
      fs.copyFile(src_path, dst_path).catch((e) => console.error(e));
    } else if (stat.isDirectory()) {
      copy_dir(src_path, dst_path);
    }
  }
}
