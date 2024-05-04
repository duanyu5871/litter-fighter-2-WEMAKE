import type { FrameAnimater } from "./FrameAnimater";
import type { Ball } from "./entity/Ball";
import type { Character } from "./entity/Character";
import type Entity from "./entity/Entity";
import type Weapon from "./entity/Weapon";

export interface ICreator<C, T extends new (...args: any[]) => C> {
  (...args: ConstructorParameters<T>): C
}

export interface Creators {
  'entity': ICreator<Entity, typeof Entity>;
  'ball': ICreator<Ball, typeof Ball>;
  'character': ICreator<Character, typeof Character>;
  'weapon': ICreator<Weapon, typeof Weapon>;
  'frame_animater': ICreator<FrameAnimater, typeof FrameAnimater>;
}
export class Factory {
  private _creators: Partial<Creators> = {}
  set<K extends keyof Creators>(k: K, creator: Creators[K]) {
    this._creators[k] = creator;
  }

  get(k: string): ICreator<FrameAnimater, typeof FrameAnimater> | undefined;
  get<K extends keyof Creators>(k: K): Creators[K] | undefined;
  get<K extends keyof Creators>(k: K): Creators[K] | undefined {
    return this._creators[k];
  }
}
export const factory = new Factory()