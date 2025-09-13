import { Defines, EntityEnum, IEntityData, IStageObjectInfo } from "../defines";
import { TeamEnum } from "../defines/TeamEnum";
import { Entity } from "../entity/Entity";
import { Factory } from "../entity/Factory";
import IEntityCallbacks from "../entity/IEntityCallbacks";
import { is_character, is_weapon } from "../entity/type_check";
import { is_num, is_str } from "../utils/type_check";
import { Stage } from "./Stage";

export default class Item {
  readonly is_enemies: boolean = false;
  times: number | undefined;
  get lf2() {
    return this.stage.lf2;
  }
  get world() {
    return this.stage.world;
  }
  readonly info: Readonly<IStageObjectInfo>;
  readonly entities = new Set<Entity>();
  readonly stage: Stage;
  readonly get_oid: () => string;

  private data_list: IEntityData[] = [];

  readonly entity_callback: IEntityCallbacks = {
    on_team_changed: (e) => {
      this.entities.delete(e); // 被移除
      if (e.team !== this.stage.team) {
        this.entity_callback.on_disposed?.(e)
      }
    },
    on_disposed: (e: Entity): void => {
      e.callbacks.del(this.entity_callback);
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
    },
  };

  constructor(stage: Stage, info: IStageObjectInfo) {
    this.stage = stage;
    this.info = info;
    this.times = info.times;
    for (const oid of this.info.id) {
      const data = this.lf2.datas.find(oid);
      if (data) {
        this.data_list.push(data);
        continue;
      }
      const { characters, weapons, entity } = this.lf2.datas.find_group(oid);
      this.data_list.push(...characters, ...weapons, ...entity);
    }
    this.is_enemies = !this.data_list.find(
      (v) => v.type !== EntityEnum.Fighter,
    );
    let waiting_data_list = [...this.data_list];
    this.get_oid = () => {
      if (!waiting_data_list.length) waiting_data_list = [...this.data_list];
      return this.lf2.random_take(waiting_data_list)?.id!;
    };
  }

  spawn(
    range_x: number = 100,
    range_y: number = 0,
    range_z: number = 0,
  ): boolean {
    const { lf2 } = this;
    const oid = this.get_oid();
    if (!oid) {
      debugger;
      return false;
    }
    const data = lf2.datas.find(oid);
    if (!data) {
      debugger;
      return false;
    }
    const creator = Factory.inst.get_entity_creator(data.type);
    if (!creator) {
      debugger;
      return false;
    }

    const { hp, act, x, y, z, reserve } = this.info;
    if (this.times) this.times--;
    const e = creator(this.world, data);
    e.ctrl = Factory.inst.get_ctrl(e.data.id, "", e);
    e.is_gone_dead = true;
    e.reserve = reserve ?? 0;
    e.position.x = this.lf2.random_in(x, x + range_x);
    e.position.z = is_num(z)
      ? this.lf2.random_in(z - range_z, z + range_z)
      : this.lf2.random_in(this.stage.near, this.stage.far);
    if (this.info.join)
      e.join_dead = {
        hp: this.info.join,
        team: this.info.join_team ?? TeamEnum.Team_1
      }
    if (is_num(hp)) e.hp_max = e.hp_r = e.hp = hp;
    if (is_num(y)) e.position.y = y;

    if (is_character(e)) {
      e.name = e.data.base.name;
    } else if (is_weapon(e) && !is_num(y)) {
      e.position.y = 450;
    }
    this.entities.add(e);
    e.team = this.stage.team;
    e.attach();
    e.callbacks.add(this.entity_callback);

    if (is_str(act)) e.enter_frame({ id: act });
    else e.enter_frame(Defines.NEXT_FRAME_AUTO);

    return true;
  }

  dispose(): void {
    this.stage.items.delete(this);
    for (const e of this.entities) {
      e.callbacks.del(this.entity_callback);
    }
  }
}
