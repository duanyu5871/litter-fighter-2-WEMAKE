import fs from "fs/promises";

export async function is_dir(path: string): Promise<boolean> {
  const r = await fs.stat(path);
  return r.isDirectory();
}
