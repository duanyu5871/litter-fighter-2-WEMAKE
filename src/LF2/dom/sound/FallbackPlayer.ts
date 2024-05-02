import { Warn } from "../../../Log";
import { is_str } from "../../../common/is_str";
import type LF2 from "../../LF2";
import { IPlayer, Src } from "../../sound/IPlayer";

export default class FallbackPlayer implements IPlayer {
  protected _r = new Map<string, string>();
  protected _prev_bgm_url: string | null = null;
  protected _ele?: HTMLAudioElement;
  protected _req_id: number = 0;
  protected _bgm: string | null = null;
  protected _sound_id = 0;
  protected _playings = new Map<string, HTMLAudioElement>()
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  bgm(): string | null {
    return this._bgm;
  }

  has(name: string): boolean {
    return this._r.has(name);
  }

  stop_bgm() {
    if (!this._ele) return;
    this._bgm = null;
    this._ele.pause();
    delete this._ele;
    this._prev_bgm_url = null;
  }

  play_bgm(name: string, restart?: boolean | undefined): () => void {
    if (!restart && this._prev_bgm_url === name) return () => { };
    if (this._ele) this.stop_bgm();
    this._bgm = name;
    this._ele = document.createElement('audio');
    this._ele.src = '' + this._r.get(name);
    this._ele.controls = false;
    this._ele.loop = true;
    this._ele.play();
    ++this._req_id;
    const req_id = this._req_id;
    this._prev_bgm_url = name;
    return () => {
      if (req_id === this._req_id) this.stop_bgm();
    };

  }

  async preload(name: string, src: Src): Promise<any> {
    const s = await src;
    const url = is_str(s) ? s : URL.createObjectURL(s);
    this._r.set(name, url);
  }

  play(name: string, x?: number, y?: number, z?: number): string {
    const src_audio = this._r.get(name);
    if (!src_audio) return '';
    const audio = document.createElement('audio');
    audio.src = src_audio;
    audio.controls = false;

    const id = '' + (++this._sound_id);
    this._playings.set(id, audio)

    audio.onerror = e => {
      Warn.print(FallbackPlayer.name, 'failed:', name, e);
      this._playings.delete(id)
    };
    audio.onended = () => this._playings.delete(id)
    return id;
  }

  stop(id: string): void {
    const n = this._playings.get(id);
    if (!n) return;
    n.pause();
    this._playings.delete(id)
  }
}
