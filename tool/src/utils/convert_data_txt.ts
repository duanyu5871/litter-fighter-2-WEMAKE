import fs from "fs/promises";
import { read_indexes } from "../../../src/LF2/dat_translator/read_indexes";
import { IDataLists } from "../../../src/LF2/defines/IDataLists";
import { read_text_file } from "./read_text_file";
import JSON5 from "json5"
import { foreach } from "../../../src/LF2/utils/container_help/foreach";
async function parse_indexes(
  src_path: string,
): Promise<IDataLists | undefined> {
  const text = await read_text_file(src_path);
  return read_indexes(text);
}
export async function convert_data_txt(
  src_dir: string,
  out_dir: string,
): Promise<IDataLists | undefined> {
  const src_path = `${src_dir}/data/data.txt`;
  const dst_path = `${out_dir}/data/data.json5`;
  console.log("convert", src_path, "=>", dst_path);
  const indexes = await parse_indexes(src_path);
  await fs.writeFile(
    dst_path, JSON5.stringify(indexes, { space: 2, quote: '"' }),
  );
  return indexes;
}
