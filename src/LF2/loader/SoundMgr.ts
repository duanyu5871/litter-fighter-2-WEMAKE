import LF2 from "../LF2";

export class SoundMgr {
  protected _map = new Map<string, string>();
  private _bgm?: HTMLAudioElement;
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  stop_bgm() {
    this._bgm?.pause()
  }
  play_bgm(bgm: string) {
    if (!this._bgm) {
      this._bgm = document.createElement('audio');
    }
    this._bgm.src = this._map.get(bgm) || bgm;
    this._bgm.controls = false;
    this._bgm.loop = true
    this._bgm.play()
    return this._bgm;
  }
  async load(key: string, src: string | Blob | Promise<string | Blob>) {
    const s = await src;
    const url = typeof s === 'string' ? s : URL.createObjectURL(s)
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

