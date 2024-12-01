import fs from 'fs/promises';
import { file_md5_str } from "./file_md5_str";
import { write_file } from './write_file';
class CacheInfo {
  cache_infos: CacheInfos;
  dst_path: string;
  src_path: string;
  salt: string;
  constructor(
    cache_infos: CacheInfos,
    src_path: string,
    dst_path: string,
    salt: string
  ) {
    this.cache_infos = cache_infos;
    this.src_path = src_path;
    this.dst_path = dst_path;
    this.salt = salt;
  }
  async is_changed() {
    const [, , cache_src_md5, cache_dst_md5] = this.cache_infos.get_raw_info(this.src_path, this.dst_path);
    const src_md5 = await file_md5_str(this.src_path, this.salt).catch(() => '');
    const dst_md5 = await file_md5_str(this.dst_path, this.salt).catch(() => '');
    return cache_src_md5 !== src_md5 || (cache_dst_md5 !== dst_md5) || !dst_md5
  }
  async update() {
    const src_md5 = await file_md5_str(this.src_path, this.salt).catch(() => '');
    const dst_md5 = await file_md5_str(this.dst_path, this.salt).catch(() => '');
    this.cache_infos.set_raw_info(this.src_path, this.dst_path, src_md5, dst_md5);
  }
  static async create(cache_infos: CacheInfos, src_path: string, dst_path: string, salt: string) {
    return new CacheInfo(cache_infos, src_path, dst_path, salt);
  }
}
export class CacheInfos {
  protected cache_info_map = new Map<string, CacheInfo>();
  protected unused_keys = new Set<string>();
  protected raw_obj: any;
  protected cache_infos_path: string;
  static async create(cache_infos_path: string) {
    const raw_obj: any = await (
      fs.readFile(cache_infos_path).then(r => {
        return r.toString()
      }).then(r => {
        return JSON.parse(r)
      }).catch(e => {
        return {}
      })
    )
    return new CacheInfos(cache_infos_path, raw_obj)
  }
  protected constructor(cache_infos_path: string, raw_obj: any) {
    this.cache_infos_path = cache_infos_path;
    this.raw_obj = raw_obj;
  }
  key(src_path: string, dst_path: string) {
    return src_path + '#' + dst_path;
  }
  async get_info(src_path: string, dst_path: string, salt: string = ''): Promise<CacheInfo> {
    const key = this.key(src_path, dst_path);
    let ret = this.cache_info_map.get(key)
    if (!ret) {
      this.cache_info_map.set(
        key,
        ret = await CacheInfo.create(this, src_path, dst_path, salt)
      )
    }
    return ret;
  }
  get_raw_info(src_path: string, dst_path: string) {
    const key = this.key(src_path, dst_path);
    return this.raw_obj[key] || [src_path, dst_path, '', ''];
  }
  set_raw_info(src_path: string, dst_path: string, src_md5: string, dst_md5: string) {
    const key = this.key(src_path, dst_path);
    return this.raw_obj[key] = [src_path, dst_path, src_md5, dst_md5];
  }
  async save() {
    await write_file(this.cache_infos_path, JSON.stringify(this.raw_obj, null, 2))
  }
}
