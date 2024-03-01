
export class SoundMgr {
  protected _map = new Map<string, string>();
  load(key: string, src: string) {
    return this._map.set(key, src);
  }
  play(key: string, x?: number, y?: number, z?: number) {
    const src_audio = this._map.get(key);
    if (!src_audio) return;
    const audio = document.createElement('audio');
    audio.src = src_audio;
    audio.controls = false;
    audio.play();
  }
}
export const sound_mgr = (window as any).sound_mgr = new SoundMgr();

