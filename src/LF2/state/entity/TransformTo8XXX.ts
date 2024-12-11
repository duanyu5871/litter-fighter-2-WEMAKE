import { new_team } from "../../base";
import { BotController } from "../../controller/BotController";
import { Defines } from "../../defines/defines";
import type Entity from "../../entity/Entity";
import { Factory } from "../../entity/Factory";
import { is_character } from "../../entity/type_check";
import BaseState from "../base/BaseState";

export default class TransformTo8XXX extends BaseState<Entity> {
  enter(e: Entity): void {
    const oid = '' + (this.state - 8000);
    const data = e.lf2.datas.find(oid);
    if (data) {
      const creator = Factory.inst.get(data.type);
      if (creator) {
        const new_entity = creator(e.world, data);
        if (!e.lastest_attacker) debugger;
        new_entity.team = e.lastest_attacker?.team || new_team();
        if (is_character(new_entity)) {
          new_entity.controller = new BotController('', new_entity);
        }
        new_entity.position.set(e.position.x, e.position.y, e.position.z);
        new_entity.variant = 1;
        new_entity.reserve = e.reserve;
        new_entity.attach();
      }
    }
    e.enter_frame({ id: Defines.FrameId.Gone })
  }
}
