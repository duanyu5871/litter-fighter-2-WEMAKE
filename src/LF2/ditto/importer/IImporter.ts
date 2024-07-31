export type BlobUrl = string;
export type HitUrl = string;
export interface IImporter {
  import_as_json<T = any>(urls: string[]): Promise<[T, HitUrl]>;
  import_as_blob(urls: string[]): Promise<[Blob, HitUrl]>;
  import_as_blob_url(urls: string[]): Promise<[BlobUrl, HitUrl]>;
}