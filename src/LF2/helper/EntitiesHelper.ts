import { new_team } from "../base";
import { IEntityData } from "../defines";
import { Factory } from "../entity";
import { Entity } from "../entity/Entity";
import LF2 from "../LF2";
import { not_empty_str } from "../utils";

export class EntitiesHelper {
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  list(): Entity[] {
    const ret: Entity[] = [];
    this.lf2.world.entities.forEach((v) => ret.push(v));
    return ret;
  }
  at(idx: number): Entity | undefined {
    return this.list()[idx];
  }
  add(data: IEntityData, num: number = 1, team?: string): Entity[] {
    const creator = Factory.inst.get_entity_creator(data.type);
    if (!creator) return [];
    const ret: Entity[] = [];
    while (--num >= 0) {
      const entity = creator(this.lf2.world, data);
      entity.team = not_empty_str(team) ? team : new_team();
      this.lf2.random_entity_info(entity).attach();
      ret.push(entity);
    }
    return ret;
  }
  del_all() {
    this.lf2.world.del_entities(Array.from(this.lf2.world.entities));
  }
}
