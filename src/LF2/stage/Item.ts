import { is_num, is_str } from "../utils/type_check";
import { IStageObjectInfo } from "../defines/IStageObjectInfo";
import { Defines } from "../defines/defines";
import { random_get, random_take, random_in } from "../utils/math/random";
import { factory } from "../Factory";
import { FrameAnimater } from "../FrameAnimater";
import { BotEnemyChaser } from "../controller/BotEnemyChaser";
import Character from "../entity/Character";
import ICharacterCallbacks from '../entity/ICharacterCallbacks';
import Entity from "../entity/Entity";
import Weapon from "../entity/Weapon";
import Stage from "./Stage";
import { IGameObjData } from "../defines";

export default class Item {
  readonly is_enemies: boolean = false;
  get lf2() { return this.stage.lf2; }
  get world() { return this.stage.world; }
  readonly info: IStageObjectInfo;
  readonly entities = new Set<FrameAnimater>();
  readonly stage: Stage;
  readonly get_oid: () => string;

  private data_list: IGameObjData[] = [];

  readonly character_callback: ICharacterCallbacks = {
    on_dead: (e: Character): void => { // 角色死亡
      e.blink_and_gone(120);
    },
    on_disposed: (e: Character): void => {
      // 角色被移除
      this.entities.delete(e);

      e.callbacks.del(this.character_callback);

      if (this.entities.size) return;

      const { times, is_soldier } = this.info;
      if (is_soldier) {
        if (this.stage.all_boss_dead()) {
          this.dispose();
        } else if (!is_num(times) || times > 0) {
          this.spawn();
        }
      } else if (times) {
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
    this.info = { ...info };
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
  ): void {
    const { lf2 } = this;
    const oid = this.get_oid();
    if (!oid) { debugger; return; }
    const data = lf2.datas.find(oid);
    if (!data) { debugger; return; }
    const creator = factory.get(data.type);
    if (!creator) { debugger; return; }

    const { hp, act, x, y, z } = this.info;
    if (this.info.times) this.info.times--;
    const e = creator(this.world, data);
    e.position.x = random_in(x - range_x, x + range_x);
    e.position.z = is_num(z) ?
      random_in(z - range_z, z + range_z) :
      random_in(this.stage.near, this.stage.far);

    if (Entity.is(e)) {
      if (is_num(hp)) e.hp = hp;
    }
    if (is_num(y)) e.position.y = y;

    if (Character.is(e)) {
      e.team = this.stage.enemy_team;
      e.name = e.data.base.name;
      e.controller = new BotEnemyChaser('', e);
    } else if (Weapon.is(e) && !is_num(y)) {
      e.position.y = 450;
    }
    this.entities.add(e);
    if (Entity.is(e)) {
      e.callbacks.add(this.character_callback);
    }

    e.attach();

    if (is_str(act)) e.enter_frame(act);
    else e.enter_frame(Defines.FrameId.Auto);
  }

  dispose(): void {
    this.stage.items.delete(this);
    for (const e of this.entities) {
      if (Entity.is(e))
        e.callbacks.del(this.character_callback);
      this.world.del_game_objs(e)
    }
  }
}
