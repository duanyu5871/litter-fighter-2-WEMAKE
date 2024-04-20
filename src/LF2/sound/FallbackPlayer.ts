import { is_str } from "../../common/is_str";
import type LF2 from "../LF2";
import { IPlayer, Src } from "./IPlayer";

export default class FallbackPlayer implements IPlayer {
  protected _map = new Map<string, string>();
  protected _prev_bgm_url: string | null = null;
  protected _bgm?: HTMLAudioElement;
  protected _req_id: number = 0;
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }

  has(name: string): boolean {
    return this._map.has(name);
  }

  stop_bgm() {
    if (!this._bgm) return;
    this._bgm.pause();
    delete this._bgm;
    this._prev_bgm_url = null;
  }
  
  play_bgm(src: string): () => void {
    if (this._prev_bgm_url === src) return () => { };
    if (this._bgm) this.stop_bgm();
    this._bgm = document.createElement('audio');
    this._bgm.src = src;
    this._bgm.controls = false;
    this._bgm.loop = true;
    this._bgm.play();
    ++this._req_id;
    const req_id = this._req_id;
    this._prev_bgm_url = src;
    return () => {
      if (req_id === this._req_id) this.stop_bgm();
    };

  }
  async preload(key: string, src: Src): Promise<any> {
    const s = await src;
    const url = is_str(s) ? s : URL.createObjectURL(s);
    this._map.set(key, url);
  }
  play(name: string, x?: number, y?: number, z?: number) {
    const src_audio = this._map.get(name);
    if (!src_audio) return;
    const audio = document.createElement('audio');
    audio.src = src_audio;
    audio.controls = false;
    audio.onerror = e => console.log('failed:', name);
    return audio.play();
  }
}
