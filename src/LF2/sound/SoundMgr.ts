import { Err } from "@fimagine/logger";
import type LF2 from "../LF2";
import FallbackPlayer from "./FallbackPlayer";
import { IPlayer, Src } from "./IPlayer";
import InvalidPlayer from "./InvalidPlayer";
import ModernPlayer from "./ModernPlayer";

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
        Err.print(SoundMgr.name, 'can not use ' + cls.name, e)
      }
    }
  }
  
  has(name: string): boolean {
    return this.inner.has(name);
  }

  preload(key: string, src: Src) {
    return this.inner.preload(key, src);
  }

  stop_bgm() {
    this.inner.stop_bgm()
  }

  play_bgm(name: string): () => void {
    return this.inner.play_bgm(name)
  }

  play(name: string, x?: number, y?: number, z?: number) {
    return this.inner.play(name, x, y, z)
  }
}

