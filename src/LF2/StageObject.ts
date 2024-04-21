import { is_num } from "../common/is_num";
import { is_str } from "../common/is_str";
import { IStageObjectInfo } from "../common/lf2_type";
import { Defines } from "../common/lf2_type/defines";
import random_get from "../common/random_get";
import random_take from "../common/random_take";
import { factory } from "./Factory";
import Stage from "./Stage";
import { random_in_range } from "./base/random_in_range";
import { BotEnemyChaser } from "./controller/BotEnemyChaser";
import { Character, ICharacterCallbacks } from "./entity/Character";
import { Entity } from "./entity/Entity";
import { Weapon } from "./entity/Weapon";

export default class StageObject implements ICharacterCallbacks {
  readonly is_enemies: boolean = false;
  get lf2() { return this.stage.lf2; }
  get world() { return this.stage.world; }
  readonly info: IStageObjectInfo;
  readonly entities = new Set<Entity>();
  readonly stage: Stage;
  readonly get_oid: () => string;

  private oid_list: string[] = [];
  private old_list_idx = 0;

  constructor(stage: Stage, info: IStageObjectInfo) {
    this.stage = stage;
    this.info = { ...info };
    const oid_len = this.oid_list.length;
    switch (this.info.id_method) {
      case 'non_repetitive':
        this.get_oid = () => {
          if (!oid_len) this.oid_list = [...this.info.id];
          return random_take(this.oid_list);
        };
        break;
      case 'once_random':
        const len = random_in_range(0, oid_len);
        const idx = Math.floor(random_in_range(0, len) % len);
        const oid = this.info.id[idx];
        this.get_oid = () => oid;
        break;
      case 'order':
        this.get_oid = () => this.info.id[this.old_list_idx = (this.old_list_idx + 1) % oid_len];
        break;
      case 'random':
      default:
        this.get_oid = () => random_get(this.info.id);
        break;
    }
    const oid = random_get(this.info.id);
    if (!oid) { debugger; return; }
    const data = this.lf2.dat_mgr.find(oid);
    if (!data) { debugger; return; }
    this.is_enemies = data.type === 'character';
  }

  add_entity(e: Entity) {
    this.entities.add(e);
    e.callbacks.add(this);
  }

  on_dead(e: Character): void {
    e.blink_and_gone(120)
  }

  on_disposed(e: Entity): void {
    this.entities.delete(e);
    e.callbacks.del(this);
    if (!this.entities.size) this.stage.handle_empty_stage_object(this);
  }

  spawn() {
    const { lf2 } = this;
    const oid = this.get_oid();
    if (!oid) { return; }
    const data = lf2.dat_mgr.find(oid);
    if (!data) { return; }
    const creator = factory.get(data.type);
    if (!creator) { return; }

    const { hp, act, x, y } = this.info;
    if (this.info.times) this.info.times--;
    const e = creator(this.world, data);
    e.position.x = random_in_range(x - 100, x + 100);
    e.position.z = random_in_range(this.stage.near, this.stage.far);
    if (is_num(y)) e.position.y = y;
    if (is_num(hp)) e.hp = hp;
    if (is_str(act)) e.enter_frame(act);
    else e.enter_frame(Defines.ReservedFrameId.Auto);

    if (e instanceof Character) {
      e.team = this.stage.enemy_team;
      e.name = e.data.base.name;
      e.controller = new BotEnemyChaser(e);
    } else if (e instanceof Weapon && !is_num(y)) {
      e.position.y = 450;
    }
    this.add_entity(e);
    e.attach();
  }
  
  dispose() {
    for (const e of this.entities) e.callbacks.del(this);
  }
}
