import { Warn } from "../../../Log";
import type LF2 from "../../LF2";
import { IPlayer } from "../../sound/IPlayer";

export default class FallbackPlayer implements IPlayer {
  protected _r = new Map<string, string>();
  protected _prev_bgm_url: string | null = null;
  protected _bgm_ele?: HTMLAudioElement;
  protected _req_id: number = 0;
  protected _sound_id = 0;
  protected _playings = new Map<string, HTMLAudioElement>()
  readonly lf2: LF2;
  protected _muted: boolean = true;
  protected _volume: number = 0.3;
  protected _bgm_volume: number = 1;
  protected _sound_volume: number = 1;
  protected _bgm_muted: boolean = false;
  protected _sound_muted: boolean = false;

  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  bgm_volume(): number {
    return this._bgm_volume
  }
  set_bgm_volume(v: number): void {
    this._bgm_volume = v;
    this.apply_bgm_volume();
  }
  sound_volume(): number {
    return this._sound_volume
  }
  set_sound_volume(v: number): void {
    this._sound_volume = v;
    this.apply_sounds_volume();
  }
  muted(): boolean {
    return this._muted;
  }
  set_muted(v: boolean): void {
    this._muted = v;
    this.apply_sounds_volume();
    this.apply_bgm_volume();
  }

  bgm_muted(): boolean {
    return this._bgm_muted;
  }
  set_bgm_muted(v: boolean): void {
    this._bgm_muted = v;
    this.apply_bgm_volume();
  }
  sound_muted(): boolean {
    return this._sound_muted;
  }
  set_sound_muted(v: boolean): void {
    this._sound_muted = v;
    this.apply_bgm_volume();
  }

  private apply_bgm_volume() {
    if (this._bgm_ele) {
      this._bgm_ele.muted = this._bgm_muted || this._muted;
      this._bgm_ele.volume = this._volume * this._bgm_volume;
    }
  }

  private apply_sounds_volume() {
    for (const [, a] of this._playings) {
      a.muted = this._sound_muted || this._muted;
      a.volume = this._volume * this._sound_volume;
    }
  }

  volume(): number {
    return this._volume;
  }

  set_volume(v: number): void {
    this._volume = v;
    this.apply_bgm_volume();
    this.apply_sounds_volume();
  }

  bgm(): string | null {
    return this._bgm_ele?.getAttribute("bgm_name") ?? null;
  }

  has(name: string): boolean {
    return this._r.has(name);
  }

  stop_bgm() {
    if (!this._bgm_ele) return;
    this._bgm_ele.pause();
    delete this._bgm_ele;
    this._prev_bgm_url = null;
  }

  play_bgm(name: string, restart?: boolean | undefined): () => void {
    if (!restart && this._prev_bgm_url === name) return () => { };
    if (this._bgm_ele) this.stop_bgm();
    this._bgm_ele = document.createElement('audio');
    this._bgm_ele?.setAttribute("bgm_name", name)
    this._bgm_ele.src = '' + this._r.get(name);
    this._bgm_ele.controls = false;
    this._bgm_ele.loop = true;
    this._bgm_ele.play();
    this._bgm_ele.volume = this._volume * this._bgm_volume;
    this._bgm_ele.muted = this._muted;
    ++this._req_id;
    const req_id = this._req_id;
    this._prev_bgm_url = name;
    return () => {
      if (req_id === this._req_id) this.stop_bgm();
    };

  }

  async load(name: string, src: string): Promise<any> {
    this._r.set(name, await this.lf2.import_resource(src));
  }

  play(name: string, x?: number, y?: number, z?: number): string {
    const src_audio = this._r.get(name);
    if (!src_audio) return '';
    const audio = document.createElement('audio');
    audio.src = src_audio;
    audio.controls = false;
    audio.volume = this._volume * this._sound_volume;
    audio.muted = this._muted;

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

  dispose(): void {
    this._playings.forEach(v => v.pause());
    this._playings.clear();

    this._bgm_ele?.pause();
    delete this._bgm_ele;

    this._r.clear();
  }
}
