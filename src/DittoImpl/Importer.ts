import axios, { AxiosResponse, RawAxiosRequestHeaders } from "axios";
import { IImporter } from "../LF2/ditto/importer/IImporter";
import { ImportError } from "../LF2/ditto/importer/ImportError";
import { PIO } from "../LF2/utils/PromisesInOne";

const roots = ["lf2_built_in_data"];
function get_possible_url_list(list: string[]): string[] {
  const ret: string[] = [];
  for (let item of list) {
    if (
      item.startsWith("blob:") ||
      item.startsWith("http:") ||
      item.startsWith("https:")
    ) {
      ret.push(item);
      continue;
    }
    if (!item.startsWith("/")) item = "/" + item;
    ret.push(item);
    for (const root of roots) ret.push(root + item);
  }
  return ret;
}

const ct_map = new Map([
  [".json", "application/json"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".jfif", "image/jpeg"],
  [".pjpeg", "image/jpeg"],
  [".pjp", "image/jpeg"],
  [".bmp", "image/bmp"],
  [".wav", "audio/wav"],
  [".wma", "audio/x-ms-wma"],
  [".mp3", "audio/mp3"],
  [".ogg", "application/ogg"],
]);
function get_req_header_accept(url: string): string | undefined {
  if (url.startsWith("blob")) return void 0;
  const ques_index = url.indexOf("?") + 1 || url.length + 1;
  const hash_index = url.indexOf("#") + 1 || url.length + 1;
  const end_index = Math.min(ques_index, hash_index) - 1;

  const path = url.substring(0, end_index).toLowerCase();

  for (const [k, v] of ct_map) {
    if (path.endsWith(k)) return v;
  }

  return void 0;
}
async function import_as<T>(
  responseType: "json" | "blob",
  urls: string[],
): Promise<[AxiosResponse<T, any>, string]> {
  const start_req = async (url: string) => {
    const headers: RawAxiosRequestHeaders = {};
    const accept = get_req_header_accept(url);
    if (accept) headers.Accept = accept;
    return await axios.get<T>(url, { responseType, headers });
  };
  const err_list: [string, any][] = [];
  for (const url of urls) {
    try {
      return [await start_req(url), url];
    } catch (e) {
      err_list.push([url, e]);
    }
  }
  throw new ImportError(urls, err_list);
}

export class __Importer implements IImporter {
  @PIO
  async import_as_json<T = any>(urls: string[]): Promise<[T, string]> {
    const url_list: string[] = get_possible_url_list(urls);
    return await import_as<T>("json", url_list).then(([v, url]) => [
      v.data,
      url,
    ]);
  }
  @PIO
  async import_as_blob(urls: string[]): Promise<[Blob, string]> {
    const url_list: string[] = get_possible_url_list(urls);
    const [resp, url] = await import_as<Blob>("blob", url_list);
    return [resp.data, url];
  }
  @PIO
  async import_as_blob_url(urls: string[]): Promise<[string, string]> {
    const [blob, url] = await this.import_as_blob(urls);
    return [URL.createObjectURL(blob), url];
  }
}
