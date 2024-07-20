
import { clamp } from "three/src/math/MathUtils";
import { Warn } from "../../Log";
import type LF2 from "../LF2";
import Callbacks from "../base/Callbacks";
import { NoEmitCallbacks } from "../base/NoEmitCallbacks";
import FallbackPlayer from "../dom/sound/FallbackPlayer";
import ModernPlayer from "../dom/sound/ModernPlayer";
import float_equal from "../utils/math/float_equal";
import type { IPlayer } from "./IPlayer";
import InvalidPlayer from "./InvalidPlayer";
export interface ISoundMgrCallback {
  on_muted_changed?(muted: boolean, mgr: SoundMgr): void;
  on_bgm_muted_changed?(muted: boolean, mgr: SoundMgr): void;
  on_sound_muted_changed?(muted: boolean, mgr: SoundMgr): void;
  on_volume_changed?(volume: number, prev: number, mgr: SoundMgr): void;
  on_bgm_changed?(bgm: string | null, prev: string | null, mgr: SoundMgr): void;
  on_bgm_volume_changed?(volume: number, prev: number, mgr: SoundMgr): void;
  on_sound_volume_changed?(volume: number, prev: number, mgr: SoundMgr): void;
}
export default class SoundMgr implements IPlayer {
  private _callbacks = new Callbacks<ISoundMgrCallback>()
  readonly lf2: LF2;
  readonly inner: IPlayer;
  readonly cls_list: (new (lf2: LF2) => IPlayer)[] = [ModernPlayer, FallbackPlayer];
  get callbacks(): NoEmitCallbacks<ISoundMgrCallback> {
    return this._callbacks
  }

  constructor(lf2: LF2) {
    this.lf2 = lf2;
    this.inner = new InvalidPlayer(lf2)

    for (const cls of this.cls_list) {
      try {
        this.inner = new cls(lf2);
        break;
      } catch (e) {
        Warn.print(SoundMgr.name, 'can not use ' + cls.name, e)
      }
    }
  }
  bgm_volume(): number {
    return this.inner.bgm_volume()
  }
  set_bgm_volume(v: number): void {
    v = clamp(v, 0, 1);
    const prev = this.bgm_volume();
    if (float_equal(v, prev)) return;
    this.inner.set_bgm_volume(v)
    this._callbacks.emit('on_bgm_volume_changed')(v, prev, this)
  }
  sound_volume(): number {
    return this.inner.sound_volume()
  }
  set_sound_volume(v: number): void {
    v = clamp(v, 0, 1);
    const prev = this.sound_volume()
    if (float_equal(v, prev)) return;
    this.inner.set_sound_volume(v)
    this._callbacks.emit('on_sound_volume_changed')(v, prev, this)
  }
  bgm_muted(): boolean {
    return this.inner.bgm_muted()
  }
  set_bgm_muted(v: boolean): void {
    if (v === this.bgm_muted()) return;
    this.inner.set_bgm_muted(v)
    this._callbacks.emit('on_bgm_muted_changed')(v, this)
  }
  sound_muted(): boolean {
    return this.inner.sound_muted()
  }
  set_sound_muted(v: boolean): void {
    if (v === this.sound_muted()) return;
    this.inner.set_sound_muted(v)
    this._callbacks.emit('on_sound_muted_changed')(v, this)
  }

  muted(): boolean { return this.inner.muted(); }

  set_muted(v: boolean): void {
    if (v === this.muted()) return;
    this.inner.set_muted(v);
    this._callbacks.emit('on_muted_changed')(v, this)
  }

  volume(): number {
    return this.inner.volume();
  }

  set_volume(v: number): void {
    v = clamp(v, 0, 1);
    const prev = this.volume()
    if (float_equal(v, prev)) return;
    this.inner.set_volume(v);
    this._callbacks.emit('on_volume_changed')(v, prev, this)
  }

  bgm(): string | null {
    return this.inner.bgm();
  }

  has(name: string): boolean {
    return this.inner.has(name);
  }

  load(key: string, src: string) {
    return this.inner.load(key, src);
  }

  stop_bgm() {
    const prev = this.bgm();
    if (!prev) return;
    this.inner.stop_bgm();
    this._callbacks.emit('on_bgm_changed')(null, prev, this);

  }

  play_bgm(name: string, restart?: boolean | undefined): () => void {
    const prev = this.inner.bgm();
    const ret = this.inner.play_bgm(name, restart);
    this._callbacks.emit('on_bgm_changed')(name, prev, this);
    return ret;
  }

  play(name: string, x?: number, y?: number, z?: number): string {
    return this.inner.play(name, x, y, z)
  }

  stop(id: string): void {
    return this.inner.stop(id);
  }

  async play_with_load(src: string, x?: number, y?: number, z?: number): Promise<string> {
    if (!this.inner.has(src))
      await this.inner.load(src, src);
    return this.inner.play(src, x, y, z);
  }
  play_preset(t: 'cancel' | 'end' | 'join' | 'ok' | 'pass', x?: number, y?: number, z?: number): void;
  play_preset(t: string, x?: number, y?: number, z?: number): void
  play_preset(t: 'cancel' | 'end' | 'join' | 'ok' | 'pass' | string, x?: number, y?: number, z?: number): void {
    switch (t) {
      case "cancel":
      case "end":
      case "join":
      case "ok":
      case "pass":
        this.play_with_load(`data/m_${t}.wav.mp3`, x, y, z);
        break;
      default:
        this.play_with_load(t, x, y, z);
        break;
    }
  }

  dispose(): void {
    this.inner.dispose();
  }
}

