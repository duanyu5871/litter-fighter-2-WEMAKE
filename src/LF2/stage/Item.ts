import { IEntityData } from "../defines";
import { IStageObjectInfo } from "../defines/IStageObjectInfo";
import { Defines } from "../defines/defines";
import Character from "../entity/Character";
import Entity from "../entity/Entity";
import { Factory } from "../entity/Factory";
import IEntityCallbacks from "../entity/IEntityCallbacks";
import { is_character, is_entity, is_weapon } from "../entity/type_check";
import { random_in, random_take } from "../utils/math/random";
import { is_num, is_str } from "../utils/type_check";
import Stage from "./Stage";

export default class Item {
  readonly is_enemies: boolean = false;
  times: number | undefined;
  get lf2() { return this.stage.lf2; }
  get world() { return this.stage.world; }
  readonly info: Readonly<IStageObjectInfo>;
  readonly entities = new Set<Entity>();
  readonly stage: Stage;
  readonly get_oid: () => string;

  private data_list: IEntityData[] = [];

  readonly entity_callback: IEntityCallbacks = {
    on_disposed: (e: Character): void => {
      this.entities.delete(e); // 被移除
      e.callbacks.del(this.entity_callback);
      if (this.entities.size) return;
      if (this.info.is_soldier) {
        if (this.stage.all_boss_dead()) {
          this.dispose();
        } else if (!is_num(this.times) || this.times > 0) {
          this.spawn();
        } else {
          this.dispose();
        }
      } else if (this.times) {
        this.spawn();
      } else {
        this.dispose();
      }
      if (this.stage.all_enemies_dead()) {
        this.stage.enter_next_phase();
      }
    }
  }

  constructor(stage: Stage, info: IStageObjectInfo) {
    this.stage = stage;
    this.info = info;
    this.times = info.times;
    for (const oid of this.info.id) {
      const data = this.lf2.datas.find(oid);
      if (data) { this.data_list.push(data); continue; }
      const { characters, weapons, entity } = this.lf2.datas.find_group(oid);
      this.data_list.push(...characters, ...weapons, ...entity);
    }
    this.is_enemies = !this.data_list.find(v => v.type !== 'character');
    let waiting_data_list = [...this.data_list];
    this.get_oid = () => {
      if (!waiting_data_list.length) waiting_data_list = [...this.data_list]
      return random_take(waiting_data_list)?.id!;
    }
  }

  spawn(
    range_x: number = 100,
    range_y: number = 0,
    range_z: number = 0
  ): boolean {
    const { lf2 } = this;
    const oid = this.get_oid();
    if (!oid) { debugger; return false; }
    const data = lf2.datas.find(oid);
    if (!data) { debugger; return false; }
    const creator = Factory.inst.get_entity_creator(data.type);
    if (!creator) { debugger; return false; }

    const { hp, act, x, y, z, reserve } = this.info;
    if (this.times) this.times--;
    const e = creator(this.world, data);
    e.controller = Factory.inst.get_ctrl_creator(e.data.id)?.('', e);
    e.reserve = reserve;
    e.position.x = random_in(x - range_x, x + range_x);
    e.position.z = is_num(z) ?
      random_in(z - range_z, z + range_z) :
      random_in(this.stage.near, this.stage.far);

    if (is_entity(e)) {
      if (is_num(hp)) e.hp = hp;
    }
    if (is_num(y)) e.position.y = y;

    if (is_character(e)) {
      e.name = e.data.base.name;
    } else if (is_weapon(e) && !is_num(y)) {
      e.position.y = 450;
    }
    this.entities.add(e);
    if (is_entity(e)) {
      e.callbacks.add(this.entity_callback);
    }
    e.team = this.stage.team;
    e.attach();

    if (is_str(act)) e.enter_frame(act);
    else e.enter_frame(Defines.FrameId.Auto);

    return true;
  }

  dispose(): void {
    this.stage.items.delete(this);
    for (const e of this.entities) {
      e.callbacks.del(this.entity_callback);
    }
  }
}
