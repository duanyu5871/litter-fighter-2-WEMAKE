import * as T from 'three';
import { IBillboardNode, IMeshNode, IObjectNode } from '../3d';
import LF2 from '../LF2';
import { get_team_shadow_color } from '../base/get_team_shadow_color';
import { get_team_text_color } from '../base/get_team_text_color';
import Ditto from '../ditto';
import type Entity from './Entity';
import type IEntityCallbacks from './IEntityCallbacks';
import { is_character } from './type_check';

const BAR_W = 40;
const BAR_H = 2;
const BAR_GEO = new T.PlaneGeometry(BAR_W, BAR_H).translate(.5 * BAR_W, -.5 * BAR_H, 0);

const BAR_BG_W = BAR_W + 2;
const BAR_BG_H = 1 + (BAR_H + 1) * 2;
const BAR_BG_GEO = new T.PlaneGeometry(BAR_BG_W, BAR_BG_H).translate(0, -.5 * BAR_BG_H, 0);

class Bar {
  readonly mesh: IMeshNode;
  protected _max: number = 0;
  protected _val: number = 0;

  constructor(lf2: LF2, color: T.ColorRepresentation) {
    this.mesh = new Ditto.MeshNode(lf2, {
      geometry: BAR_GEO,
      material: new T.MeshBasicMaterial({ visible: true, color })
    })
  }
  set max(v: number) {
    this._max = v;
    this.mesh.set_scale_x(this._val / this._max)
  };
  set val(v: number) {
    this._val = Math.max(0, v);
    this.mesh.set_scale_x(this._val / this._max)
  };
  set(val: number, max: number) {
    this._max = max;
    this._val = val;
    this.mesh.set_scale_x(this._val / this._max)
  }
}

export class InfoSprite implements IEntityCallbacks {
  protected mesh: IBillboardNode;
  protected bars_node: IObjectNode;
  protected bars_bg: IMeshNode;

  protected self_healing_hp_bar: Bar;
  protected hp_bar: Bar;

  protected self_healing_mp_bar: Bar;
  protected mp_bar: Bar;

  protected entity: Entity;

  get visible() { return this.mesh.visible; }
  set visible(v) {
    this.mesh.visible = this.bars_node.visible = v;
  }

  constructor(entity: Entity) {
    const { lf2 } = entity;
    this.mesh = new Ditto.BillboardNode(lf2, {
      material: new T.SpriteMaterial({ visible: false })
    });
    this.bars_node = new Ditto.ObjectNode(lf2)

    this.bars_bg = new Ditto.MeshNode(lf2, {
      geometry: BAR_BG_GEO,
      material: new T.MeshBasicMaterial({ color: 'rgb(0,0,0)' })
    })

    this.self_healing_hp_bar = new Bar(lf2, 'rgb(111,8,31)');
    this.hp_bar = new Bar(lf2, 'rgb(255,0,0)');

    this.self_healing_mp_bar = new Bar(lf2, 'rgb(31,8,111)');
    this.mp_bar = new Bar(lf2, 'rgb(0,0,255)');


    this.mesh.name = InfoSprite.name;
    this.mesh.renderOrder = 0;
    this.entity = entity;
    entity.inner.on('added', () => this.on_mount(entity));
    entity.inner.on('removed', () => this.on_unmount(entity));

    this.bars_node.add(this.bars_bg)

    const hp_x = -BAR_W / 2;
    const hp_y = -1;

    this.bars_node.add(this.bars_bg)

    this.self_healing_hp_bar.mesh.set_position(hp_x, hp_y);
    this.bars_node.add(this.self_healing_hp_bar.mesh)

    this.hp_bar.mesh.set_position(hp_x, hp_y);
    this.bars_node.add(this.hp_bar.mesh)

    const mp_x = -BAR_W / 2;
    const mp_y = -2 - BAR_H;

    this.self_healing_mp_bar.mesh.set_position(mp_x, mp_y);
    this.bars_node.add(this.self_healing_mp_bar.mesh)

    this.mp_bar.mesh.set_position(mp_x, mp_y);
    this.bars_node.add(this.mp_bar.mesh);

    this.hp_bar.set(500, 500);
    this.mp_bar.set(500, 500);
    this.self_healing_hp_bar.set(500, 500);
    this.self_healing_mp_bar.set(500, 500);

  }

  protected on_mount(entity: Entity) {
    if (
      is_character(this.entity) &&
      this.entity.world.lf2.player_infos.has(
        this.entity.controller.player_id
      )
    ) {
      entity.world.scene.add(this.bars_node, this.mesh);
    }
    entity.callbacks.add(this);
    this.update_name_sprite(entity, entity.name, entity.team);
  }

  protected on_unmount(entity: Entity) {
    this.bars_node.del_self();
    this.mesh.del_self();
    entity.callbacks.del(this)
  }

  on_name_changed(entity: Entity, name: string): void {
    this.update_name_sprite(entity, name, entity.team)
  }

  on_team_changed(entity: Entity, team: string): void {
    this.update_name_sprite(entity, entity.name, team)
  }

  on_hp_changed(_e: Entity, value: number): void { this.hp_bar.val = value; }
  on_mp_changed(_e: Entity, value: number): void { this.mp_bar.val = value; }
  on_max_hp_changed(_e: Entity, value: number): void { this.self_healing_hp_bar.max = value; }
  on_max_mp_changed(_e: Entity, value: number): void { this.self_healing_mp_bar.max = value; }
  on_self_healing_hp_changed(_e: Entity, value: number): void { this.self_healing_hp_bar.val = value; }
  on_self_healing_mp_changed(_e: Entity, value: number): void { this.self_healing_mp_bar.val = value; }


  private update_name_sprite(e: Entity, name: string, team: string) {
    const fillStyle = get_team_text_color(team)
    const strokeStyle = get_team_shadow_color(team);
    const world = e.world;
    const lf2 = world.lf2;
    if (!name) {
      this.mesh.material.visible = false;
      this.mesh.material.map = null;
      return;
    }
    lf2.images.load_text(name, { shadow_color: strokeStyle, fill_style: fillStyle, smoothing: false })
      .then((i) => lf2.images.create_pic_by_img_key(i.key))
      .then((p) => {
        if (name !== e.name) return;
        if (team !== e.team) return;

        this.mesh.material.visible = true;

        this.mesh.material.map?.dispose();
        this.mesh.material.map = p.texture;
        this.mesh.material.needsUpdate = true;

        this.mesh.set_scale(p.w, p.h, 1);
        this.mesh.name = 'name sprite'
      });
  }

  update_position() {
    const { x, z, y } = this.entity.position;

    const _x = Math.floor(x);
    const name_y = Math.floor(-z / 2 - this.mesh.scale_y)
    this.set_name_position(_x, name_y, z);

    const bar_y = Math.floor(y - z / 2 + this.entity.inner.scale_y + BAR_BG_H + 5);
    this.set_bars_position(_x, bar_y, z)
  }

  set_name_position(x: number, y: number, z: number) {
    const hw = (this.mesh.scale_x + 10) / 2
    const { x: cam_l } = this.entity.world.camera;
    const cam_r = cam_l + this.entity.world.screen_w;
    if (x + hw > cam_r) x = cam_r - hw;
    else if (x - hw < cam_l) x = cam_l + hw;

    this.mesh.set_position(x, y, z);
  }

  set_bars_position(x?: number, y?: number, z?: number) {
    this.bars_node.set_position(x, y, z)
  }
}
