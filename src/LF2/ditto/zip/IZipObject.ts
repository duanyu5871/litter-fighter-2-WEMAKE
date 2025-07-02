export interface IZipObject {
  name: string;

  /**
   * 读取为文本
   *
   * @returns {Promise<string>} 
   */
  text(): Promise<string>;


  /**
   * 读取为json
   *
   * @template [T=any] 
   * @returns {Promise<T>} 
   */
  json<T = any>(): Promise<T>;


  /**
   * 读取为blob
   *
   * @returns {Promise<Blob>} 
   */
  blob(): Promise<Blob>;


  /**
   * 读取为blob_url
   *
   * @returns {Promise<string>} 
   */
  blob_url(): Promise<string>;
}
