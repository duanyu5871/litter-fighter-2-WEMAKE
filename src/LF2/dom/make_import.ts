import axios, { AxiosResponse } from "axios";
import { is_str } from "../utils/type_check";

const roots = [
  'lf2_data',
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
    for (const root of roots)
      ret.push(root + item);
  }
  return ret;
}

export async function import_as<T>(responseType: 'json' | 'blob', url: string): Promise<AxiosResponse<T, any>>
export async function import_as<T>(responseType: 'json' | 'blob', url_list: string[]): Promise<AxiosResponse<T, any>>;
export async function import_as<T>(responseType: 'json' | 'blob', url_list_or_url: string | string[]): Promise<AxiosResponse<T, any>> {

  if (is_str(url_list_or_url))
    return await axios.get<T>(url_list_or_url, { responseType })

  const err_list: [string, any][] = [];
  for (const url of url_list_or_url) {
    try {
      return await axios.get<T>(url, { responseType });
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