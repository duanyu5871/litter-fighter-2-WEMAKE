export default interface IZipObject {
  text(): Promise<string>;
  json<T = any>(): Promise<T>;
  blob(): Promise<Blob>;
  blob_url(): Promise<string>;
}