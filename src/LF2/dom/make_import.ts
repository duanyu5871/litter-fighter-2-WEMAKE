import axios, { AxiosResponse, RawAxiosRequestHeaders } from "axios";
import { is_str } from "../utils/type_check";

const roots = [
  'lf2_built_in_data'
]
function get_possible_url_list(list: string[]): string[] {
  const ret: string[] = [];
  for (let item of list) {
    if (
      item.startsWith('blob:') ||
      item.startsWith('http:') ||
      item.startsWith('https:')
    ) {
      ret.push(item);
      continue;
    }
    if (!item.startsWith('/'))
      item = '/' + item;
    ret.push(item);
    for (const root of roots)
      ret.push(root + item);
  }
  return ret;
}

const ct_map = new Map([
  ['.json', 'application/json'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.jfif', 'image/jpeg'],
  ['.pjpeg', 'image/jpeg'],
  ['.pjp', 'image/jpeg'],
  ['.bmp', 'image/bmp'],
  ['.wav', 'audio/wav'],
  ['.wma', 'audio/x-ms-wma'],
  ['.mp3', 'audio/mp3'],
  ['.ogg', 'application/ogg'],
])
function get_req_header_accept(url: string): string | undefined {
  if (url.startsWith('blob')) return void 0;
  const ques_index = url.indexOf('?') + 1 || url.length + 1;
  const hash_index = url.indexOf('#') + 1 || url.length + 1;
  const end_index = Math.min(ques_index, hash_index) - 1;


  const path = url.substring(0, end_index).toLowerCase()

  for (const [k, v] of ct_map) {
    if (path.endsWith(k)) return v;
  }

  return void 0;
}
async function import_as<T>(responseType: 'json' | 'blob', url: string): Promise<AxiosResponse<T, any>>
async function import_as<T>(responseType: 'json' | 'blob', url_list: string[]): Promise<AxiosResponse<T, any>>;
async function import_as<T>(responseType: 'json' | 'blob', url_list_or_url: string | string[]): Promise<AxiosResponse<T, any>> {

  const start_req = async (url: string) => {
    const headers: RawAxiosRequestHeaders = {};
    const accept = get_req_header_accept(url);
    if (accept) headers.Accept = accept
    return await axios.get<T>(url, { responseType, headers })
  }

  if (is_str(url_list_or_url))
    return start_req(url_list_or_url);

  const err_list: [string, any][] = [];
  for (const url of url_list_or_url) {
    try {
      return await start_req(url);
    } catch (e) {
      err_list.push([url, e]);
    }
  }
  throw new MakeImportError(url_list_or_url, err_list)
}

export async function import_as_json(path_or_url_list: string[]): Promise<any> {
  const url_list: string[] = get_possible_url_list(path_or_url_list);
  return await import_as<any>('json', url_list).then(v => v.data);
}
export async function import_as_blob(path_or_url_list: string[]): Promise<Blob> {
  const url_list: string[] = get_possible_url_list(path_or_url_list);
  return await import_as<Blob>('blob', url_list).then(v => v.data);
}
export async function import_as_blob_url(path_or_url_list: string[]): Promise<[string, string]> {
  const url_list: string[] = get_possible_url_list(path_or_url_list);
  const err_list: [string, any][] = [];
  for (const url of url_list) {
    if (url.startsWith('blob'))
      return [url, url];
    try {
      const resp = await import_as<Blob>('blob', url);
      return [await URL.createObjectURL(resp.data), url];
    } catch (e) {
      err_list.push([url, e]);
    }
  }
  throw new MakeImportError(url_list, err_list)
}

export class MakeImportError extends Error {
  static is = (v: any): v is MakeImportError => v.is_make_import_error === true;
  readonly is_make_import_error = true;
  readonly url_err_pair_list: [string, any][];
  constructor(path_or_url_list: string[], url_err_pair_list: any[]) {
    super(`failed, path or url: ${path_or_url_list.join(', ')}`);
    this.name = 'MakeImportError';
    this.url_err_pair_list = url_err_pair_list;
  }
}