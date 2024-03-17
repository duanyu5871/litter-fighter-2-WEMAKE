import random_get from "../Utils/random_get";
import { is_num } from "../js_utils/is_num";
import { is_str } from "../js_utils/is_str";
import { IBgData, IStageInfo, IStageObjectInfo, IStagePhaseInfo } from "../js_utils/lf2_type";
import { Defines } from "../js_utils/lf2_type/defines";
import { Background } from "./Background";
import { factory } from "./Factory";
import type { World } from "./World";
import { Character } from "./entity/Character";
import { Entity } from "./entity/Entity";
import { Weapon } from "./entity/Weapon";
import { random_in_range } from "./random_in_range";

export default class Stage {
  readonly world: World;
  readonly data: IStageInfo;
  readonly bg: Background;
  readonly enemy_team: number;
  private _disposed: boolean = false;
  private _disposers: (() => void)[] = [];
  private _bgm_enable: boolean;
  private _cur_phase?: IStagePhaseInfo;
  get left() { return this.bg.left }
  get right() { return this.bg.right }
  get near() { return this.bg.near }
  get far() { return this.bg.far }
  get width() { return this.bg.width }
  get depth() { return this.bg.depth }
  get middle() { return this.bg.middle }
  get lf2() { return this.world.lf2 }
  constructor(world: World, data: IStageInfo | IBgData) {
    this.world = world;
    this._bgm_enable = this.world.lf2.stage_bgm_enable;
    if ('type' in data && data.type === 'background') {
      this.data = Defines.THE_VOID_STAGE;
      this.bg = new Background(world, data);
    } else if ('bg' in data) {
      this.data = data;
      const bg_data = this.world.lf2.dat_mgr.backgrounds.find(v => v.id === 'bg_' + this.data.bg)// FIXME;
      this.bg = new Background(world, bg_data ?? Defines.THE_VOID_BG);
    } else {
      this.data = Defines.THE_VOID_STAGE;
      this.bg = new Background(world, Defines.THE_VOID_BG);
    }
    this.enemy_team = Entity.new_team()
    if (this.data.phases.length) {
      const phase = this.data.phases[0]
      if (phase) this.enter_phase(phase);
    }
  }
  private _stop_bgm?: () => void;
  private async try_play_phase_bgm(phase_info: IStagePhaseInfo | undefined = this._cur_phase) {
    if (!phase_info) return;
    if (!this._bgm_enable) return;
    const { lf2 } = this;
    const { music } = phase_info;
    if (!music) return;
    await lf2.sound_mgr.load(music, lf2.import(music))
    if (this._disposed) return;
    this._stop_bgm = lf2.sound_mgr.play_bgm(music)
    this._disposers.push(this._stop_bgm);

  }

  async enter_phase(phase_info: IStagePhaseInfo) {
    this._cur_phase = phase_info;
    const { objects } = phase_info;
    this.try_play_phase_bgm(phase_info)
    for (const object of objects) {
      this.spawn_object(object);
    }
  }

  set_bgm_enable(enabled: boolean) {
    this._bgm_enable = enabled;
    if (enabled) this.try_play_phase_bgm();
    else if (this._stop_bgm) this._stop_bgm();
  }
  async spawn_object(obj_info: IStageObjectInfo) {
    const { lf2 } = this;
    const oid = random_get(obj_info.id);
    if (!oid) { debugger; return; }

    const data = lf2.dat_mgr.find(oid)
    if (!data) { debugger; return; }

    const creator = factory.get(data.type)
    if (!creator) { debugger; return; }

    const player_count = Math.max(1, this.world.players.size);

    const { hp, ratio = 1, times = 1, act, x, y } = obj_info;

    let spawn_count = Math.floor(player_count * ratio);
    while ((--spawn_count) >= 0) {
      const e = creator(this.world, data);
      e.position.x = random_in_range(x - 100, x + 100);
      e.position.z = random_in_range(this.near, this.far);

      if (is_num(y)) e.position.y = y;
      if (is_num(hp)) e.hp = hp;
      if (is_str(act)) e.enter_frame(act);
      else e.enter_frame(Defines.ReservedFrameId.Auto);

      if (e instanceof Character) {
        e.team = this.enemy_team;
        e.name = e.data.base.name;
      } else if (e instanceof Weapon && !is_num(y)) {
        e.position.y = 450;
      }
      e.attach();
    }
  }

  dispose() {
    this._disposed = true;
    for (const f of this._disposers) f();
    this.bg.dispose()
  }
}
