import axios from 'axios';
import JSZIP from 'jszip';
import { is_str } from '../../common/is_str';
export class ZipObject {
  protected inner: JSZIP.JSZipObject;
  get name() { return this.inner.name }

  constructor(inner: JSZIP.JSZipObject) {
    this.inner = inner;
  }
  async text(): Promise<string> {
    return this.inner.async('text');
  }
  async json(): Promise<any> {
    return this.text().then(JSON.parse);
  }
  async blob(): Promise<Blob> {
    return this.inner.async('blob');
  }
  async blob_url(): Promise<string> {
    return URL.createObjectURL(await this.blob())
  }
}

export default class Zip {
  static async read_file(file: File): Promise<Zip> {
    return JSZIP.loadAsync(file).then(v => new Zip(v))
  }

  static async download(url: string, on_progress: (progress: number, size: number) => void): Promise<Zip> {
    const resp = await axios.get(url, {
      responseType: 'blob',
      onDownloadProgress: (e) => {
        const progress = e.total ? Math.round(100 * e.loaded / e.total) : 100;
        on_progress(progress, e.total ?? e.loaded);
      }
    });
    return JSZIP.loadAsync(resp.data).then(v => new Zip(v));
  }

  private inner: JSZIP;
  private constructor(inner: JSZIP) {
    this.inner = inner;
  }

  file(path: string): ZipObject | null
  file(path: RegExp): ZipObject[]
  file(path: string | RegExp): ZipObject | null | ZipObject[] {
    if (is_str(path)) {
      const obj = this.inner.file(path)
      return obj ? new ZipObject(obj) : null;
    } else {
      return this.inner.file(path).map(v => new ZipObject(v));
    }
  }
}
