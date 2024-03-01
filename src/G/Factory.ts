import type { Ball } from "./Ball";

export interface Creators {
  'ball': (...args: ConstructorParameters<typeof Ball>) => Ball;
}

export class Factory {
  private _creators: Partial<Creators> = {}
  set<K extends keyof Creators>(k: K, creator: Creators[K]) {
    this._creators[k] = creator;
  }
  get<K extends keyof Creators>(k: K): Creators[K] | undefined {
    return this._creators[k]
  }
}
export const factory = new Factory()