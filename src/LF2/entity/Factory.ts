import type Ball from "./Ball";
import type Character from "./Character";
import type Entity from "./Entity";
import type Weapon from "./Weapon";

export interface ICreator<C, T extends new (...args: any[]) => C> {
  (...args: ConstructorParameters<T>): C
}

export interface Creators {
  'entity': ICreator<Entity, typeof Entity>;
  'ball': ICreator<Ball, typeof Ball>;
  'character': ICreator<Character, typeof Character>;
  'weapon': ICreator<Weapon, typeof Weapon>;
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
  protected static _inst: Factory;
  static get inst(): Factory {
    if (!this._inst) this._inst = new Factory()
    return this._inst;
  }
}