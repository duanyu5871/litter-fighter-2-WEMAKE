
import { Warn } from "../../Log";
import type LF2 from "../LF2";
import FallbackPlayer from "../dom/sound/FallbackPlayer";
import ModernPlayer from "../dom/sound/ModernPlayer";
import type { IPlayer } from "./IPlayer";
import InvalidPlayer from "./InvalidPlayer";

export default class SoundMgr implements IPlayer {
  readonly lf2: LF2;
  readonly inner: IPlayer;
  readonly cls_list = [ModernPlayer, FallbackPlayer] as const;

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

  bgm(): string | null {
    return this.inner.bgm();
  }

  has(name: string): boolean {
    return this.inner.has(name);
  }

  preload(key: string, src: string) {
    return this.inner.preload(key, src);
  }

  stop_bgm() {
    this.inner.stop_bgm()
  }

  play_bgm(name: string, restart?: boolean | undefined): () => void {
    return this.inner.play_bgm(name, restart)
  }

  play(name: string, x?: number, y?: number, z?: number): string {
    return this.inner.play(name, x, y, z)
  }

  stop(id: string): void {
    return this.inner.stop(id);
  }

  async play_with_load(src: string, x?: number, y?: number, z?: number): Promise<string> {
    if (!this.inner.has(src))
      await this.inner.preload(src, src);
    return this.inner.play(src, x, y, z);
  }

  play_preset(t: 'cancel' | 'end' | 'join' | 'ok' | 'pass', x?: number, y?: number, z?: number): void {
    this.play_with_load(`data/m_${t}.wav.ogg`, x, y, z)
  }

  dispose(): void {
    this.inner.dispose();
  }
}

