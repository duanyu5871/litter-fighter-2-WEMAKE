
export class SoundMgr {
  private _bgm?: HTMLAudioElement;
  stop_bgm() {
    this._bgm?.pause()
  }
  play_bgm(bgm: string) {
    if (!this._bgm) {
      this._bgm = document.createElement('audio');
    }
    this._bgm.src = bgm;
    console.log(bgm)
    this._bgm.controls = false;
    this._bgm.loop = true
    this._bgm.play()
    return this._bgm;
  }
  protected _map = new Map<string, string>();
  load(key: string, src: string) {
    return this._map.set(key, src);
  }
  get(key: string, x?: number, y?: number, z?: number) {
    const src_audio = this._map.get(key);
    if (!src_audio) return;
    const audio = document.createElement('audio');
    audio.src = src_audio;
    audio.controls = false;
    return audio;
  }
  play(key: string, x?: number, y?: number, z?: number) {
    return this.get(key, x, y, z)?.play();
  }
}
export const sound_mgr = (window as any).sound_mgr = new SoundMgr();

