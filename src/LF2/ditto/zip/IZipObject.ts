export interface IZipObject {
  name: string;
  text(): Promise<string>;
  json<T = any>(): Promise<T>;
  blob(): Promise<Blob>;
  blob_url(): Promise<string>;
}
