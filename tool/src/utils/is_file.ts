import fs from "fs/promises";

export async function is_file(path: string): Promise<boolean> {
  const r = await fs.stat(path);
  return r.isFile();
}
