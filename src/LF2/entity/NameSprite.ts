import * as T from 'three';
import { get_team_shadow_color } from '../base/get_team_shadow_color';
import { get_team_text_color } from '../base/get_team_text_color';
import type { Entity, IEntityCallbacks } from './Entity';

const BAR_W = 40;
const BAR_H = 2;
const BAR_GEO = new T.PlaneGeometry(BAR_W, BAR_H).translate(.5 * BAR_W, -.5 * BAR_H, 0);

const BAR_BG_W = BAR_W + 2;
const BAR_BG_H = 1 + (BAR_H + 1) * 2;
const BAR_BG_GEO = new T.PlaneGeometry(BAR_BG_W, BAR_BG_H).translate(0, -.5 * BAR_BG_H, 0);

class Bar {
  readonly mesh: T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial>;
  get position() { return this.mesh.position }
  protected _max: number = 0;
  protected _val: number = 0;

  constructor(color: T.ColorRepresentation) {
    this.mesh = new T.Mesh(BAR_GEO, new T.MeshBasicMaterial({ visible: true, color }))
  }
  set max(v: number) {
    this._max = v;
    this.mesh.scale.x = this._val / this._max;
  };
  set val(v: number) {
    this._val = Math.max(0, v);
    this.mesh.scale.x = this._val / this._max;
  };
  set(val: number, max: number) {
    this._max = max;
    this._val = val;
    this.mesh.scale.x = this._val / this._max;
  }
}

export class NameSprite implements IEntityCallbacks {
  protected mesh = new T.Sprite(new T.SpriteMaterial({ visible: false }));

  protected bars_node = new T.Object3D()
  protected bars_bg = new T.Mesh(
    BAR_BG_GEO,
    new T.MeshBasicMaterial({ visible: true, color: 'rgb(0,0,0)' })
  )

  protected self_healing_hp_bar = new Bar('rgb(111,8,31)');
  protected hp_bar = new Bar('rgb(255,0,0)');

  protected self_healing_mp_bar = new Bar('rgb(31,8,111)');
  protected mp_bar = new Bar('rgb(0,0,255)');

  protected entity: Entity;

  get visible() { return this.mesh.visible; }
  set visible(v) { this.mesh.visible = v; }

  constructor(entity: Entity) {
    this.mesh.name = NameSprite.name;
    this.mesh.renderOrder = 0;
    this.entity = entity;
    entity.mesh.addEventListener('added', () => this.on_mount(entity));
    entity.mesh.addEventListener('removed', () => this.on_unmount(entity));

    this.bars_node.add(this.bars_bg)

    const hp_x = -BAR_W / 2;
    const hp_y = -1;

    this.bars_node.add(this.bars_bg)

    this.self_healing_hp_bar.position.set(hp_x, hp_y, 0);
    this.bars_node.add(this.self_healing_hp_bar.mesh)

    this.hp_bar.position.set(hp_x, hp_y, 0);
    this.bars_node.add(this.hp_bar.mesh)

    const mp_x = -BAR_W / 2;
    const mp_y = -2 - BAR_H;

    this.self_healing_mp_bar.position.set(mp_x, mp_y, 0);
    this.bars_node.add(this.self_healing_mp_bar.mesh)

    this.mp_bar.position.set(mp_x, mp_y, 0);
    this.bars_node.add(this.mp_bar.mesh);

    this.hp_bar.set(500, 500);
    this.mp_bar.set(500, 500);
    this.self_healing_hp_bar.set(500, 500);
    this.self_healing_mp_bar.set(500, 500);

  }

  protected on_mount(entity: Entity) {
    entity.world.scene.add(this.bars_node);
    entity.world.scene.add(this.mesh);
    entity.callbacks.add(this)
    this.update_name_sprite(entity, entity.name, entity.team)
  }

  protected on_unmount(entity: Entity) {
    this.bars_node.removeFromParent();
    this.mesh.removeFromParent();
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
    lf2.img_mgr.load_text(name, { shadowColor: strokeStyle, fillStyle, smoothing: false })
      .then((i) => lf2.img_mgr.create_picture_by_img_key('', i.key))
      .then((p) => {
        if (name !== e.name) return;
        if (team !== e.team) return;

        this.mesh.material.visible = true;
        this.mesh.material.map = p.texture;
        this.mesh.material.needsUpdate = true;

        this.mesh.scale.set(p.i_w, p.i_h, 1);
        this.mesh.name = 'name sprite'
      });
  }

  update_position() {
    const { x, z } = this.entity.position;

    const _x = Math.floor(x);
    let _y = Math.floor(-z / 2 - this.mesh.scale.y)
    this.set_name_position(_x, _y, z);

    _y = Math.floor(_y - this.mesh.scale.y);
    this.set_bars_position(_x, _y, z)
  }

  set_name_position(x: number, y: number, z: number) {
    const hw = (this.mesh.scale.x + 10) / 2
    const { x: cam_l } = this.entity.world.camera.position;
    const cam_r = cam_l + this.entity.world.screen_w;
    if (x + hw > cam_r) x = cam_r - hw;
    else if (x - hw < cam_l) x = cam_l + hw;

    this.mesh.position.set(x, y, z);
  }

  set_bars_position(x: number, y: number, z: number) {
    this.bars_node.position.set(x, y, z)
  }
}
