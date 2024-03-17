import { is_str } from "../../js_utils/is_str";
import LF2 from "../LF2";
type Src = string | Blob | Promise<string | Blob>;
export class SoundMgr {
  protected _map = new Map<string, string>();
  private _req_id: number = 0;
  private _bgm?: HTMLAudioElement;
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  stop_bgm() {
    this._bgm?.pause()
  }
  play_bgm(bgm: string): () => void {
    if (!this._bgm) this._bgm = document.createElement('audio');
    this._bgm.src = this._map.get(bgm) || bgm;
    this._bgm.controls = false;
    this._bgm.loop = true
    this._bgm.play();
    ++this._req_id;
    const req_id = this._req_id;
    return () => {
      if (req_id === this._req_id) this._bgm?.pause()
    };
  }
  async load(key: string, src: Src) {
    const s = await src;
    const url = is_str(s) ? s : URL.createObjectURL(s)
    this._map.set(key, url);
  }
  get(key: string, x?: number, y?: number, z?: number) {
    const src_audio = this._map.get(key);
    if (!src_audio) return;
    const audio = document.createElement('audio');
    audio.src = src_audio;
    audio.controls = false;
    audio.onerror = e => console.log('failed:', key)
    return audio;
  }
  play(key: string, x?: number, y?: number, z?: number) {
    return this.get(key, x, y, z)?.play();
  }
}

