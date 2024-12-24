import type { BaseController } from "../controller/BaseController";
import { EntityEnum } from "../defines/EntityEnum";
import type Entity from "./Entity";

export interface ICreator<C, T extends new (...args: any[]) => C> {
  (...args: ConstructorParameters<T>): C
}

export interface EntityCreators {
  [EntityEnum.Entity]: ICreator<Entity, typeof Entity>;
  [EntityEnum.Ball]: ICreator<Entity, typeof Entity>;
  [EntityEnum.Character]: ICreator<Entity, typeof Entity>;
  [EntityEnum.Weapon]: ICreator<Entity, typeof Entity>;
}

export type ControllerCreator = ICreator<BaseController, typeof BaseController>
export type ControllerCreators = {
  [x in string]?: ControllerCreator
}

let _factory_inst: Factory | undefined = void 0;
let _entity_creators: Partial<EntityCreators> = {};
let _ctrl_creators: ControllerCreators = {};
export class Factory {
  set_entity_creator<K extends keyof EntityCreators>(k: K, creator: EntityCreators[K]) {
    _entity_creators[k] = creator;
  }
  get_entity_creator(type: string): ICreator<Entity, typeof Entity> | undefined;
  get_entity_creator<K extends keyof EntityCreators>(type: K): EntityCreators[K] | undefined;
  get_entity_creator<K extends keyof EntityCreators>(type: K): EntityCreators[K] | undefined {
    return _entity_creators[type];
  }
  get_ctrl_creator(id: string): ControllerCreator | undefined {
    return _ctrl_creators[id]
  }
  set_ctrl_creator(id: string, creator: ControllerCreator) {
    return _ctrl_creators[id] = creator;
  }
  static get inst(): Factory {
    if (!_factory_inst) _factory_inst = new Factory()
    return _factory_inst;
  }
}
