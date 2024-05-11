import type LF2 from "../LF2";
import { IPlayer } from "./IPlayer";

export default class InvalidPlayer implements IPlayer {
  readonly lf2: LF2;
  constructor(lf2: LF2) { this.lf2 = lf2; }

  has(name: string): boolean { return false; }
  stop_bgm(): void { }
  bgm(): string | null { return null; }
  play_bgm(name: string): () => void { return () => void 0 }
  preload(name: string, src: string): Promise<any> { return Promise.reject(new Error(InvalidPlayer.name)) }
  play(name: string, x?: number | undefined, y?: number | undefined, z?: number | undefined): string { return '' }
  stop(id: string): void { }
  dispose(): void { }
}