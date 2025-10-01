import json5 from "json5";
import { write_file } from "./write_file";

export async function write_obj_file(dst_path: string, content: any) {
  const file_content = dst_path.endsWith('.json5') ?
    json5.stringify(content, { space: 2, quote: '"' }) :
    JSON.stringify(content, null, 2)
  return await write_file(dst_path, file_content);
}