import { zip } from "compressing";
import fs from "fs/promises";
import { join } from "path";
import { file_md5_str } from "./file_md5_str";
import { is_dir } from "./is_dir";
import { write_file } from "./write_file";

export interface IZipFileInfo {
  url: string;
  md5: string;
  time: string;
  type: string;
  infos?: { [x in string]?: any };
}
/**
 * 压缩源目录，生成zip文件与“信息json文件”
 *
 * 源目录本身会被忽略
 *
 * 会产生以下两个文件:
 *
 *    ${out_dir}/${zip_name}
 *
 *    ${out_dir}/${zip_name}.json
 *
 * @see {IZipFileInfo} 信息json文件的结构可见ZipFileInfo
 * @export
 * @async
 * @param {string} src_dir 源目录
 * @param {string} out_dir 输出目录
 * @param {string} zip_name 压缩文件名，需要包括后缀
 * @param {} edit_info 编辑最后信息文件
 * @returns {Promise<void>}
 */
export async function make_zip_and_json(
  src_dir: string,
  out_dir: string,
  zip_name: string,
  edit_info?: (info: IZipFileInfo) => IZipFileInfo | PromiseLike<IZipFileInfo>,
): Promise<void> {
  src_dir = src_dir.replace(/\\/g, "/");
  out_dir = out_dir.replace(/\\/g, "/");
  console.log("zipping", src_dir, "=>", join(out_dir, zip_name));

  const layout_dir = src_dir + '/layouts'
  const layout_index_file = src_dir + '/layouts/index.json'
  await fs.unlink(layout_index_file).catch(() => { });
  await fs.readdir(layout_dir).then((names) => {
    const paths: string[] = []
    for (const name of names) {
      if (!name.match(/\.json?$/)) continue;
      paths.push('layouts/' + name)
    }
    const str = JSON.stringify(paths, null, 2);
    return fs.writeFile(layout_index_file, str)
  }).catch(e => { })

  if (!(await is_dir(src_dir)))
    throw new Error("[make_zip_and_json] src_dir " + src_dir + "不是目录");
  if (!(await is_dir(out_dir)))
    throw new Error("[make_zip_and_json] out_dir " + out_dir + "不是目录");

  const zip_path = join(out_dir, zip_name);
  const inf_path = join(out_dir, zip_name + ".json");
  await fs.unlink(zip_path).catch(() => { });
  await zip.compressDir(src_dir, zip_path, { ignoreBase: true });

  async function read_sub_info_json(path: string, infos: any = {}) {
    const items = await fs.readdir(path);
    for (const name of items) {
      const sub_path = join(path, name).replace(/\\/g, "/");
      const stat = await fs.stat(sub_path);
      if (stat.isDirectory()) {
        await read_sub_info_json(sub_path, infos);
      } else if (stat.isFile()) {
        if (name === "__info.json") {
          infos[path.replace(src_dir, "/")] = await fs
            .readFile(sub_path)
            .then((v) => JSON.parse(v.toString()));
        }
      }
    }
    return infos;
  }
  let inf: IZipFileInfo = {
    type: '',
    url: zip_name,
    md5: await file_md5_str(zip_path),
    infos: await read_sub_info_json(src_dir),
    time: new Date().toISOString(),
  };
  inf = edit_info ? await edit_info(inf) : inf;
  await write_file(inf_path, JSON.stringify(inf));
}
