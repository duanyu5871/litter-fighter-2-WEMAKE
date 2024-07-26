
import { clamp } from "three/src/math/MathUtils";
import { Warn } from "../../../Log";
import type LF2 from "../../LF2";
import BaseSounds from "../../ditto/sounds/BaseSounds";
import type ISounds from "../../ditto/sounds/ISounds";
import float_equal from "../../utils/math/float_equal";
import { __Fallback } from "./Fallback";
import { __Modern } from "./Modern";

export class __Sounds extends BaseSounds {
  readonly inner: ISounds;
  readonly cls_list: (new (lf2: LF2) => ISounds)[] = [__Modern, __Fallback];
  constructor(lf2: LF2) {
    super(lf2);
    this.inner = new BaseSounds(lf2)
    for (const cls of this.cls_list) {
      try {
        this.inner = new cls(lf2);
        break;
      } catch (e) {
        Warn.print(__Sounds.name, 'can not use ' + cls.name, e)
      }
    }
  }
  override bgm_volume(): number {
    return this.inner.bgm_volume()
  }
  override set_bgm_volume(v: number): void {
    return this.inner.set_bgm_volume(v)
  }
  override sound_volume(): number {
    return this.inner.sound_volume()
  }
  override set_sound_volume(v: number): void {
    return this.inner.set_sound_volume(v)
  }
  override bgm_muted(): boolean {
    return this.inner.bgm_muted()
  }
  override set_bgm_muted(v: boolean): void {
    return this.inner.set_bgm_muted(v)
  }
  override sound_muted(): boolean {
    return this.inner.sound_muted()
  }
  override set_sound_muted(v: boolean): void {
    return this.inner.set_sound_muted(v)
  }
  override muted(): boolean {
    return this.inner.muted();
  }
  override set_muted(v: boolean): void {
    return this.inner.set_muted(v);
  }
  override volume(): number {
    return this.inner.volume();
  }
  override set_volume(v: number): void {
    return this.inner.set_volume(v);
  }
  override bgm(): string | null {
    return this.inner.bgm();
  }
  override has(name: string): boolean {
    return this.inner.has(name);
  }
  override load(key: string, src: string) {
    return this.inner.load(key, src);
  }
  override stop_bgm(): void {
    return this.inner.stop_bgm();
  }
  override play_bgm(name: string, restart?: boolean | undefined): () => void {
    return this.inner.play_bgm(name, restart);
  }
  override play(name: string, x?: number, y?: number, z?: number): string {
    return this.inner.play(name, x, y, z)
  }
  override stop(id: string): void {
    return this.inner.stop(id);
  }

  override async play_with_load(src: string, x?: number, y?: number, z?: number): Promise<string> {
    return this.inner.play_with_load(src, x, y, z)
  }
  override play_preset(t: 'cancel' | 'end' | 'join' | 'ok' | 'pass', x?: number, y?: number, z?: number): void;
  override play_preset(t: string, x?: number, y?: number, z?: number): void
  override play_preset(t: 'cancel' | 'end' | 'join' | 'ok' | 'pass' | string, x?: number, y?: number, z?: number): void {
    return this.inner.play_preset(t, x, y, z)
  }

  override dispose(): void {
    super.dispose();
    this.inner.dispose();
  }
}

