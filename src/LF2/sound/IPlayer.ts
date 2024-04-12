export type Src = string | Blob | Promise<string | Blob>;

export interface IPlayer {

  /**
   * 停止背景音乐
   * @date 4/12/2024 - 10:22:30 AM
   */
  stop_bgm(): void;


  /**
   * 播放背景音乐
   * @date 4/12/2024 - 10:23:17 AM
   *
   * @param {string} name
   * @returns {() => void} 此方法将停止本次play_bgm播放的背景音乐
   */
  play_bgm(name: string): () => void;


  /**
   * 预加载声音资源
   * @date 4/12/2024 - 10:25:37 AM
   *
   * @param {string} name 声音名
   * @param {Src} src 声音源
   * @returns {Promise<any>}
   */
  preload(name: string, src: Src): Promise<any>;

  
  /**
   * 对应名称声音是否存在
   * @date 4/12/2024 - 10:45:14 AM
   *
   * @param {string} name 声音名
   * @returns {boolean} 存在返回true 否则返回false
   */
  has(name: string): boolean; 

  /**
   * 播放音效
   * @date 4/12/2024 - 10:25:08 AM
   *
   * @param {string} name 声音名
   * @param {?number} [x] 音效产生位置x
   * @param {?number} [y] 音效产生位置y
   * @param {?number} [z] 音效产生位置z
   */
  play(name: string, x?: number, y?: number, z?: number): void;
}
