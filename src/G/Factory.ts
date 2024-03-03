import type { Ball } from "./Ball";
import type { Character } from "./Character";
import type { Entity } from "./Entity";

export interface ICreator<C, T extends new (...args: any[]) => C> {
  (...args: ConstructorParameters<T>): C
}

export interface Creators {
  'ball': ICreator<Ball, typeof Ball>;
  'character': ICreator<Character, typeof Character>;
}
export class Factory {
  private _creators: Partial<Creators> = {}
  set<K extends keyof Creators>(k: K, creator: Creators[K]) {
    this._creators[k] = creator;
  }

  get(k: string): ICreator<Entity, typeof Entity> | undefined;
  get<K extends keyof Creators>(k: K): Creators[K] | undefined;
  get<K extends keyof Creators>(k: K): Creators[K] | undefined {
    return this._creators[k];
  }
}
export const factory = new Factory()