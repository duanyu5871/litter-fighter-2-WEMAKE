import { Callbacks, FPS, ICollision } from "./base";
import { collisions_keeper } from "./collision/CollisionKeeper";
import {
  ALL_ENTITY_ENUM,
  Builtin_FrameId, Defines,
  HitFlag,
  IBdyInfo, IBounding, IEntityData,
  IFrameInfo, IItrInfo, ItrKind, StateEnum
} from "./defines";
import { Ditto } from "./ditto";
import { IWorldRenderer } from "./ditto/render/IWorldRenderer";
import {
  Entity, Factory, ICreator, is_ball,
  is_bot_ctrl,
  is_character,
  is_local_ctrl,
  is_weapon
} from "./entity";
import { IWorldCallbacks } from "./IWorldCallbacks";
import { LF2 } from "./LF2";
import { Stage } from "./stage/Stage";
import { abs, find, floor, is_num, min, round } from "./utils";
import { WorldDataset } from "./WorldDataset";
export class World extends WorldDataset {
  static override readonly TAG: string = "World";
  readonly lf2: LF2;
  readonly callbacks = new Callbacks<IWorldCallbacks>();

  private _spark_data?: IEntityData;
  private _spark_creator?: ICreator<Entity, typeof Entity>;
  private _stage: Stage;
  private _need_FPS: boolean = true;
  private _need_UPS: boolean = true;
  private _FPS = new FPS(0.9);
  private _UPS = new FPS(0.9);
  private _render_worker_id?: ReturnType<typeof Ditto.Render.add>;
  private _update_worker_id?: ReturnType<typeof Ditto.Interval.add>;
  entities = new Set<Entity>();
  incorporeities = new Set<Entity>();

  readonly slot_fighters = new Map<string, Entity>();
  readonly collisions: ICollision[] = [];
  get stage() {
    return this._stage;
  }
  set stage(v) {
    if (v === this._stage) return;
    const o = this._stage;
    this._stage = v;
    this.callbacks.emit("on_stage_change")(v, o);
    o.dispose();
    v.enter_phase(0);
  }
  override on_dataset_change = (k: string, curr: any, prev: any) => {
    this.callbacks.emit('on_dataset_change')(k as any, curr, prev, this)
  };
  on_sync_render_change(curr: any, prev: any) {
    this.callbacks.emit('on_sync_render_changed')(curr, prev)
    this.start_render();
    this.start_update();
  }
  get bg() {
    return this._stage.bg;
  }
  get left() {
    return this.bg.left || 0;
  }
  get right() {
    return this.bg.right || 0;
  }
  get near() {
    return this.bg.near || 0;
  }
  get far() {
    return this.bg.far || 0;
  }
  get width() {
    return this.bg.width || 0;
  }
  get depth() {
    return this.bg.depth || 0;
  }
  get middle() {
    return this.bg.middle || { x: 0, z: 0 };
  }

  cam_speed = 0;
  lock_cam_x: number | undefined = void 0;
  public renderer: IWorldRenderer

  constructor(lf2: LF2) {
    super()
    this.lf2 = lf2;
    this._stage = new Stage(this, Defines.VOID_BG);
    this.renderer = new Ditto.WorldRender(this);
  }
  add_incorporeities(...entities: Entity[]) {
    for (const entity of entities) {
      this.incorporeities.add(entity);
      this.renderer.add_entity(entity);
    }
  }
  add_entities(...entities: Entity[]) {
    for (const entity of entities) {
      if (is_character(entity)) {
        this.callbacks.emit("on_fighter_add")(entity);
        if (this.lf2.players.has(entity.ctrl.player_id)) {
          this.slot_fighters.set(entity.ctrl.player_id, entity);
          this.callbacks.emit("on_player_character_add")(entity.ctrl.player_id);
        }
      }
      this.entities.add(entity);
      this.renderer.add_entity(entity);
    }
  }

  list_enemy_fighters(e: Entity, fn: (other: Entity) => boolean): Entity[] {
    const ret: Entity[] = []
    for (const o of this.entities) {
      if (!e.is_ally(o) && is_character(o) && fn(o)) {
        ret.push(o)
      }
    }
    const { x, z } = e.position;
    ret.sort(({ position: a }, { position: b }) => abs(a.x - x) + abs(a.z - z) / 2 - abs(b.x - x) - abs(b.z - z) / 2)
    return ret;
  }

  list_ally_fighters(e: Entity, fn: (other: Entity) => boolean): Entity[] {
    const ret: Entity[] = []
    for (const o of this.entities) {
      if (e.is_ally(o) && is_character(o) && fn(o)) {
        ret.push(o)
      }
    }
    const { x, z } = e.position;
    ret.sort(({ position: a }, { position: b }) => abs(a.x - x) + abs(a.z - z) / 2 - abs(b.x - x) - abs(b.z - z) / 2)
    return ret;
  }

  del_entity(entity: Entity) {
    if (!(this.entities.delete(entity) || this.incorporeities.delete(entity)))
      return false;

    if (is_character(entity))
      this.callbacks.emit("on_fighter_del")(entity);
    if (entity.ctrl?.player_id) {
      const ok = this.slot_fighters.delete(entity.ctrl.player_id);
      if (ok) this.callbacks.emit("on_player_character_del")(entity.ctrl.player_id);
    }
    this.renderer.del_entity(entity);
    entity.dispose();
    return true;
  }

  del_entities(entities: Entity[]) {
    for (const e of entities) {
      this.del_entity(e);
    }
  }

  stop_render() {
    this._render_worker_id && Ditto.Render.del(this._render_worker_id);
    this._render_worker_id = 0;
  }

  start_render() {
    if (this._render_worker_id) Ditto.Render.del(this._render_worker_id);
    if (this.sync_render) return;
    let _r_prev_time = 0;
    const on_render = (time: number) => {
      const dt = time - _r_prev_time;
      if (_r_prev_time !== 0) {
        this.render_once(dt);
      }
      if (_r_prev_time !== 0 && this._need_FPS) {
        this._FPS.update(dt);
        this.callbacks.emit("on_fps_update")(this._FPS.value);
      }
      _r_prev_time = time;
    };
    this._render_worker_id && Ditto.Render.del(this._render_worker_id);
    this._render_worker_id = Ditto.Render.add(on_render);
  }

  stop_update() {
    this._update_worker_id && Ditto.Interval.del(this._update_worker_id);
    this._update_worker_id = void 0;
  }

  start_update() {
    if (this._update_worker_id) Ditto.Interval.del(this._update_worker_id);
    let _prev_time = Date.now();
    let _update_count = 0;
    let _fix_radio = 1;
    const on_update = () => {
      const time = Date.now();
      const real_dt = time - _prev_time;
      if (real_dt < this._ideally_dt * _fix_radio) return;

      this.lf2.ui?.enabled && this.lf2.ui?.update(real_dt);
      _update_count++;

      for (const key of this.lf2.cmds) {
        switch (key) {
          case 'f1':
            this.set_paused(!this.paused);
            break;
          case 'f2':
            this.set_paused(true);
            this.update_once();
            break;
          case 'f4':
            this.lf2.ui_stacks.length >= 2 && this.lf2.pop_ui()
            break;
          case 'f5':
            this.playrate = this.playrate === 1 ? 100 : 1;
            break;
          case 'f6':
            this.lf2.infinity_mp = !this.lf2.infinity_mp;
            break;
          case 'f7':
            for (const e of this.entities) e.hp = e.hp_max;
            break;
        }
      }
      this.lf2.cmds.length = 0
      if (!this._paused) this.update_once();
      this.update_camera();
      this.bg.update();

      if (0 === _update_count % this.sync_render) {
        this.render_once(real_dt);
        this.callbacks.emit("on_fps_update")(this._UPS.value / this.sync_render);
      }
      this._UPS.update(real_dt);
      _fix_radio = this._UPS.value / 60;
      if (this._need_UPS) {
        this.callbacks.emit("on_ups_update")(this._UPS.value, 0);
      }
      _prev_time = time;
    };
    this._update_worker_id = Ditto.Interval.add(on_update, 0);
  }

  /**
   * 限制角色位置
   * 
   * @param {Entity} e 角色实体
   * @return {void} 
   * @memberof World
   */
  restrict_fighter(e: Entity): void {
    if (!this.bg) return;
    const { left, right, near, far, player_left, player_right, team } = this.stage;

    const is_player = e.team !== team;
    const l = is_player ? player_left : left;
    const r = is_player ? player_right : right;

    const { x, z } = e.position;
    if (x < l) e.position.x = l;
    else if (x > r) e.position.x = r;

    if (z < far) e.position.z = far;
    else if (z > near) e.position.z = near;
  }

  /**
   * 限制“波”位置
   *
   * 当“波”离开地图太远，直接标记为移除
   * 
   * @param {Entity} e “波”
   * @return {void}
   * @memberof World
   */
  restrict_ball(e: Entity): void {
    if (!this.bg) return;
    const { left, right, near, far } = this.bg.data.base;
    const { x, z } = e.position;
    if (x < left - 800) e.enter_frame(Defines.NEXT_FRAME_GONE);
    else if (x > right + 800) e.enter_frame(Defines.NEXT_FRAME_GONE);
    if (z < far) e.position.z = far;
    else if (z > near) e.position.z = near;
  }

  /**
   * 限制“武器”位置
   *
   * 当“武器”离开地图太远，直接标记为移除
   * 
   * @param {Entity} e “武器”
   * @return {void}
   * @memberof World
   */
  restrict_weapon(e: Entity): void {
    if (!this.bg) return;
    const { left, right, near, far } = this.bg.data.base;
    const { x, z } = e.position;
    if (x < left - 100) e.enter_frame(Defines.NEXT_FRAME_GONE);
    else if (x > right + 100) e.enter_frame(Defines.NEXT_FRAME_GONE);
    if (z < far) e.position.z = far;
    else if (z > near) e.position.z = near;
  }

  /**
   * 限制“实体”位置
   *
   * @param {Entity} e
   * @memberof World
   */
  restrict(e: Entity): void {
    if (is_character(e)) {
      this.restrict_fighter(e);
    } else if (is_ball(e)) {
      this.restrict_ball(e);
    } else if (is_weapon(e)) {
      this.restrict_weapon(e);
    }
  }

  manhattan(e1: Entity, e2: Entity) {
    const p1 = e1.position;
    const p2 = e2.position;
    return abs(p1.x - p2.x) + abs(p1.z - p2.z);
  }

  private gone_entities: Entity[] = [];
  private _enemy_chasers = new Set<Entity>();
  private _ally_chasers = new Set<Entity>();
  add_enemy_chaser(entity: Entity) {
    this._enemy_chasers.add(entity);
  }
  del_enemy_chaser(entity: Entity) {
    this._enemy_chasers.delete(entity);
    entity.chasing = void 0;
  }
  add_ally_chaser(entity: Entity) {
    this._ally_chasers.add(entity);
  }
  del_ally_chaser(entity: Entity) {
    this._ally_chasers.delete(entity);
    entity.chasing = void 0;
  }

  protected _time = 0;
  get time() { return this._time }
  protected _updating = 0
  update_once() {
    this._updating = 1;
    if (this._time === Number.MAX_SAFE_INTEGER) this._time = 0;
    else ++this._time;
    for (const e of this.entities) {
      e.self_update();

      if (e.chasing && !e.chasing.ctrl) {
        e.chasing = void 0;
      }

      for (const chaser of this._enemy_chasers) {
        if (!is_character(e) || chaser.is_ally(e) || e.hp <= 0)
          continue;
        const prev = chaser.chasing;
        if (!prev || this.manhattan(prev, chaser) > this.manhattan(e, chaser)) {
          chaser.chasing = e;
        }
      }
      for (const chaser of this._ally_chasers) {
        if (!is_character(e) || !chaser.is_ally(e) || e.hp <= 0)
          continue;
        const prev = chaser.chasing;
        if (!prev || this.manhattan(prev, chaser) > this.manhattan(e, chaser)) {
          chaser.chasing = e;
        }
      }
    }
    this.gone_entities.length = 0;
    for (const e of this.entities) {
      e.update();
      if (
        e.frame.id === Builtin_FrameId.Gone ||
        e.frame.state === StateEnum.Gone
      ) {
        this.gone_entities.push(e);
      }
    }
    for (const e of this.incorporeities) {
      e.self_update();
      e.update();
      if (
        e.frame.id === Builtin_FrameId.Gone ||
        e.frame.state === StateEnum.Gone
      ) {
        this.gone_entities.push(e);
      }
    }
    this.del_entities(this.gone_entities);
    this.collision_detections();
    this.stage.update();
    this._updating = 0;
  }

  render_once(dt: number) {
    this.renderer.render(dt);
  }

  update_camera() {

    const old_cam_x = floor(this.renderer.cam_x);
    if (this.bg.id === Defines.VOID_BG.id) {
      this.renderer.cam_x = 0
      if (old_cam_x !== 0) {
        this.callbacks.emit("on_cam_move")(0);
      }
      return;
    }


    const { camera_left, left, camera_right, right } = this.stage;
    const max_cam_left = is_num(this.lock_cam_x) ? left : camera_left;
    const max_cam_right = is_num(this.lock_cam_x) ? right : camera_right;
    let new_x = this.renderer.cam_x;
    let max_speed_ratio = 50;
    let acc_ratio = 1;
    if (is_num(this.lock_cam_x)) {
      new_x = this.lock_cam_x;
    } else if (this.slot_fighters.size) {
      let l = 0;
      new_x = 0;
      const has_human_player = find(
        this.slot_fighters,
        ([_, p]) => is_local_ctrl(p.ctrl) && p.hp > 0,
      );
      if (has_human_player) { // 取中间部分
        for (const [, player] of this.slot_fighters) {
          const c = player.ctrl;
          if (!is_local_ctrl(c)) continue;
          new_x += player.position.x - this.screen_w / 2 + (player.facing * this.screen_w) / 6;
          ++l;
        }
      } else {
        for (const [, player] of this.slot_fighters) {
          new_x += player.position.x - this.screen_w / 2
          ++l;
        }
      }

      new_x = floor(new_x / l);
    } else {

    }
    if (new_x < max_cam_left) new_x = max_cam_left;
    if (new_x > max_cam_right - this.screen_w) new_x = max_cam_right - this.screen_w;
    let cur_x = this.renderer.cam_x;
    const acc = min(
      acc_ratio,
      0.5 * (acc_ratio * abs(cur_x - new_x)) / this.screen_w,
    );
    const max_speed = max_speed_ratio * acc;

    if (cur_x > new_x) {
      if (this.cam_speed > 0) this.cam_speed = 0;
      else if (this.cam_speed > -max_speed) this.cam_speed -= acc;
      else this.cam_speed = -max_speed;
      this.renderer.cam_x += this.cam_speed;
      if (this.renderer.cam_x < new_x) this.renderer.cam_x = new_x;
    } else if (cur_x < new_x) {
      if (this.cam_speed < 0) this.cam_speed = 0;
      else if (this.cam_speed < max_speed) this.cam_speed += acc;
      else this.cam_speed = max_speed;
      this.renderer.cam_x += this.cam_speed;
      if (this.renderer.cam_x > new_x) this.renderer.cam_x = new_x;
    }

    const new_cam_x = floor(this.renderer.cam_x);
    if (old_cam_x !== new_cam_x) {
      this.callbacks.emit("on_cam_move")(new_cam_x);
    }
  }

  private _temp_entitis_set = new Set<Entity>();
  private _used_itrs = new Set<IItrInfo>()
  collision_detections() {
    this.collisions.length = 0;
    this._used_itrs.clear()
    this._temp_entitis_set.clear();

    for (const a of this.entities) {
      const a_ctrl = a.ctrl
      for (const b of this._temp_entitis_set) {
        const b_ctrl = b.ctrl;
        if (is_bot_ctrl(b_ctrl)) b_ctrl.look_other(a)
        if (is_bot_ctrl(a_ctrl)) a_ctrl.look_other(b)

        const collision1 = this.collision_detection(a, b);
        const collision2 = this.collision_detection(b, a);
        if (collision1?.handlers && collision2?.handlers) {
          const index1 = ALL_ENTITY_ENUM.indexOf(collision1.attacker.type)
          const index2 = ALL_ENTITY_ENUM.indexOf(collision2.attacker.type)
          if (index1 < index2)
            this.collisions.push(collision1)
          else if (index1 > index2)
            this.collisions.push(collision2)
          else
            this.collisions.push(collision1, collision2)
        }
        else if (collision1?.handlers) this.collisions.push(collision1)
        else if (collision2?.handlers) this.collisions.push(collision2)
      }
      this._temp_entitis_set.add(a);
    }
    for (const collision of this.collisions) {
      collisions_keeper.handle(collision)
    }
  }

  collision_detection(a: Entity, b: Entity): ICollision | undefined {
    const af = a.frame;
    const bf = b.frame;
    if (!af.itr?.length || !bf.bdy?.length) return;
    const l0 = af.itr.length;
    const l1 = bf.bdy.length;
    for (let i = 0; i < l0; ++i) {
      for (let j = 0; j < l1; ++j) {
        const itr = af.itr[i]!
        const bdy = bf.bdy[j]!

        if (!itr.vrest && this._used_itrs.has(itr)) return;

        const collision = this.collision_test(a, af, itr, b, bf, bdy);

        if (!collision) continue;

        if (!itr.vrest) this._used_itrs.add(itr)
        collision.handlers = collisions_keeper.handler(collision)
        return collision
      }
    }
  }

  collision_test(
    attacker: Entity,
    aframe: IFrameInfo,
    itr: IItrInfo,
    victim: Entity,
    bframe: IFrameInfo,
    bdy: IBdyInfo,
  ): ICollision | undefined {

    if (!itr.vrest && attacker.a_rest) return;
    if (itr.kind !== ItrKind.Heal) {
      const b_catcher = victim.catcher;
      if (victim.blinking || victim.invisible || victim.invulnerable) return;
      if (b_catcher && b_catcher.frame.cpoint?.hurtable !== 1) return;
    }
    switch (aframe.state) {
      case StateEnum.Weapon_OnHand: {
        const atk = attacker.holder?.frame.wpoint?.attacking;
        if (!atk) return;
        const itr_prefab = attacker.data.itr_prefabs?.[atk];
        if (!itr_prefab) return;
        itr = { ...itr, ...itr_prefab };
        break;
      }
    }

    const a_cube = this.get_bounding(attacker, aframe, itr);
    const b_cube = this.get_bounding(victim, bframe, bdy);
    if (!(
      a_cube.left <= b_cube.right &&
      a_cube.right >= b_cube.left &&
      a_cube.bottom <= b_cube.top &&
      a_cube.top >= b_cube.bottom &&
      a_cube.far <= b_cube.near &&
      a_cube.near >= b_cube.far
    )) return;

    const ally_flag = attacker.is_ally(victim) ? HitFlag.Ally : HitFlag.Enemy;
    if (
      0 == (itr.hit_flag & victim.data.type) ||
      0 == (bdy.hit_flag & attacker.data.type) || 
      0 != (itr.hit_flag & ally_flag) &&
      0 != (bdy.hit_flag & ally_flag)
    ) return;


    if (!itr.vrest && attacker.a_rest) return;
    if (itr.vrest && victim.get_v_rest(attacker.id) > 0) return;

    const collision: ICollision = {
      v_rest: !itr.arest && itr.vrest ? itr.vrest + this.vrest_offset : void 0,
      victim,
      attacker,
      itr,
      bdy,
      aframe,
      bframe,
      a_cube,
      b_cube,
    };
    if (
      bdy.tester?.run(collision) === false ||
      itr.tester?.run(collision) === false
    ) return;

    return collision
  }

  init_spark_data() {
    this._spark_data = this.lf2.datas.find(Defines.BuiltIn_Dats.Spark);
    this._spark_creator = this._spark_data ? Factory.inst.get_entity_creator(this._spark_data.type) : void 0;
  }

  /**
   * 火花特效
   *
   * @param {number} x x坐标
   * @param {number} y y坐标
   * @param {number} z z坐标
   * @param {string} f 帧ID
   * @return {void}
   * @memberof World
   */
  spark(x: number, y: number, z: number, f: string): void {
    if (!this._spark_data)
      this.init_spark_data();
    if (!this._spark_data) {
      Ditto.warn(
        World.TAG + "::spark",
        `data of "${Defines.BuiltIn_Dats.Spark}" not found!`,
      );
      return;
    }
    if (!this._spark_creator) {
      Ditto.warn(World.TAG + "::spark", `creator of "${this._spark_data.type}" not found!`);
      return;
    }
    const e = this._spark_creator(this, this._spark_data);
    e.position.set(round(x), round(y), round(z));
    e.enter_frame({ id: f });
    e.attach(false);
  }
  etc(x: number, y: number, z: number, f: string): void {
    const data = this.lf2.datas.find(998);
    if (!data) {
      Ditto.warn(
        World.TAG + "::etc",
        `data of "${998}" not found!`,
      );
      return;
    }

    const create = Factory.inst.get_entity_creator(data.type)

    if (!create) {
      Ditto.warn(World.TAG + "::etc", `creator of "${998}" not found!`);
      return;
    }
    const e = create(this, data);
    e.position.set(round(x), round(y), round(z));
    e.enter_frame({ id: f });
    e.attach(false);
  }
  get_bounding(e: Entity, f: IFrameInfo, i: IItrInfo | IBdyInfo): IBounding {
    const left =
      e.facing > 0
        ? e.position.x - f.centerx + i.x
        : e.position.x + f.centerx - i.x - i.w;
    const top = e.position.y + f.centery - i.y;
    const far = e.position.z + i.z;
    return {
      left,
      right: left + i.w,
      top,
      bottom: top - i.h,
      far,
      near: far + i.l,
    };
  }

  private _ideally_dt: number = floor(1000 / 60);
  private _playrate: number = 1;

  get playrate() {
    return this._playrate;
  }
  set playrate(v: number) {
    if (v <= 0) throw new Error("playrate must be larger than 0");
    if (v === this._playrate) return;
    this._playrate = v;
    this._ideally_dt = floor(1000 / 60) / this._playrate;
    this.start_update();
  }

  private _paused = false;
  get paused() { return this._paused; }
  set paused(v: boolean) { this.set_paused(v); }
  indicator_flags: number = 0;

  set_paused(v: boolean) {
    if (this._paused === v) return;
    this._paused = v;
    this.callbacks.emit("on_pause_change")(v);
  }

  dispose() {
    this.callbacks.emit("on_disposed")();
    this.stop_update();
    this.stop_render();
    this.del_entities(Array.from(this.entities));
    this.renderer.dispose();
    this.callbacks.clear()
  }
}