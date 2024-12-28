import fs from "fs/promises";

export async function write_file(path: string, data: string) {
  await fs.unlink(path).catch(() => {});
  await fs.writeFile(path, data);
}
