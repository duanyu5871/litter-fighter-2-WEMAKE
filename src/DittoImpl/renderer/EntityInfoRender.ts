import type { IBillboardNode, IMeshNode, IObjectNode } from "../../LF2/3d";
import { get_team_shadow_color } from "../../LF2/base/get_team_shadow_color";
import { get_team_text_color } from "../../LF2/base/get_team_text_color";
import { GameKey, IVector3, Labels } from "../../LF2/defines";
import Ditto from "../../LF2/ditto";
import type { Entity } from "../../LF2/entity/Entity";
import type IEntityCallbacks from "../../LF2/entity/IEntityCallbacks";
import type { LF2 } from "../../LF2/LF2";
import * as T from "../3d/_t";
import { WorldRenderer } from "./WorldRenderer";

const BAR_W = 40;
const BAR_H = 3;
const BAR_BG_W = BAR_W + 2;
const BAR_BG_H = 1 + (BAR_H + 1) * 2 + 4;
const geo_map = new Map<string, T.PlaneGeometry>();

function get_bar_geo(w: number, h: number, ax: number, ay: number) {
  const key = `w_h_a_${w}_${h}`;
  let ret = geo_map.get(key);
  if (!ret)
    geo_map.set(
      key,
      (ret = new T.PlaneGeometry(w, h).translate(ax * w, ay * h, 0)),
    );
  return ret;
}

const material_map = new Map<T.ColorRepresentation, T.MeshBasicMaterial>();
function get_color_material(color: T.ColorRepresentation) {
  const key =
    typeof color === "string" || typeof color === "number"
      ? `c_${color}`
      : color
        ? color
        : "c_void";

  let ret = material_map.get(key);
  if (!ret)
    material_map.set(
      key,
      (ret = new T.MeshBasicMaterial({ visible: true, color })),
    );
  return ret;
}
class Bar {
  readonly mesh: IMeshNode;
  protected _max: number = 1;
  protected _val: number = 1;

  set max(v: number) {
    this._max = v;
    this.mesh.set_scale_x(this._val / this._max);
  }
  set val(v: number) {
    this._val = Math.max(0, v);
    this.mesh.set_scale_x(this._val / this._max);
  }
  set color(color: string) {
    this.mesh.material = get_color_material(color)
  }
  constructor(
    lf2: LF2,
    color: T.ColorRepresentation,
    w: number,
    h: number,
    ax: number,
    ay: number,
  ) {
    this.mesh = new Ditto.MeshNode(lf2, {
      geometry: get_bar_geo(w, h, ax, ay),
      material: get_color_material(color),
    });
  }

  set(val: number, max: number) {
    this._max = max;
    this._val = val;
    this.mesh.set_scale_x(this._val / this._max);
  }
}

export class EntityInfoRender implements IEntityCallbacks {
  readonly renderer_type: string = "Info";
  protected name_node: IBillboardNode;
  protected bars_node: IObjectNode;
  protected bars_bg: Bar;

  protected self_healing_hp_bar: Bar;
  protected hp_bar: Bar;

  protected self_healing_mp_bar: Bar;
  protected mp_bar: Bar;

  protected fall_value_bar: Bar;
  protected defend_value_bar: Bar;

  entity: Entity;
  protected heading: number = 0;

  protected key_nodes: Map<GameKey, { node: IBillboardNode, pos: IVector3 }>

  get visible() {
    return this.name_node.visible;
  }
  set visible(v) {
    this.name_node.visible = this.bars_node.visible = v;
  }

  constructor(entity: Entity) {
    const { lf2 } = entity.world;
    const f = 7;
    this.key_nodes = new Map([
      [GameKey.U, { node: new Ditto.BillboardNode(lf2), pos: new Ditto.Vector3(f * (-2 + 0.5), f * 2, 0) }],
      [GameKey.D, { node: new Ditto.BillboardNode(lf2), pos: new Ditto.Vector3(f * (-2 + 0.5), f * 0, 0) }],
      [GameKey.L, { node: new Ditto.BillboardNode(lf2), pos: new Ditto.Vector3(f * (-3 + 0.5), f * 1, 0) }],
      [GameKey.R, { node: new Ditto.BillboardNode(lf2), pos: new Ditto.Vector3(f * (-1 + 0.5), f * 1, 0) }],

      [GameKey.a, { node: new Ditto.BillboardNode(lf2), pos: new Ditto.Vector3(f * (1 - 0.5), f * 0, 0) }],
      [GameKey.j, { node: new Ditto.BillboardNode(lf2), pos: new Ditto.Vector3(f * (2 - 0.5), f * 1, 0) }],
      [GameKey.d, { node: new Ditto.BillboardNode(lf2), pos: new Ditto.Vector3(f * (3 - 0.5), f * 2, 0) }],
    ])

    this.name_node = new Ditto.BillboardNode(lf2);
    this.bars_node = new Ditto.ObjectNode(lf2);
    this.bars_bg = new Bar(lf2, "rgb(0,0,0)", BAR_BG_W, BAR_BG_H, 0.5, 0);
    this.self_healing_hp_bar = new Bar(
      lf2,
      "rgb(111,8,31)",
      BAR_W,
      BAR_H,
      0.5,
      1,
    );
    this.hp_bar = new Bar(lf2, "rgb(255,0,0)", BAR_W, BAR_H, 0.5, 1);

    this.self_healing_mp_bar = new Bar(
      lf2,
      "rgb(31,8,111)",
      BAR_W,
      BAR_H,
      0.5,
      1,
    );
    this.mp_bar = new Bar(lf2, "rgb(0,0,255)", BAR_W, BAR_H, 0.5, 1);

    this.fall_value_bar = new Bar(lf2, "rgb(216, 115, 0)", BAR_W, 1, 0.5, 1);
    this.defend_value_bar = new Bar(lf2, "rgb(0, 122, 71)", BAR_W, 1, 0.5, 1);

    this.name_node.name = EntityInfoRender.name;
    this.name_node.render_order = 0;
    this.entity = entity;

    let y = -1;

    this.bars_bg.mesh.set_position(-1, -2);
    this.bars_node.add(this.bars_bg.mesh);

    this.self_healing_hp_bar.mesh.set_position(0, y);
    this.bars_node.add(this.self_healing_hp_bar.mesh);

    this.hp_bar.mesh.set_position(0, y);
    this.bars_node.add(this.hp_bar.mesh);
    y = y - 1 - BAR_H;

    this.self_healing_mp_bar.mesh.set_position(0, y);
    this.bars_node.add(this.self_healing_mp_bar.mesh);

    this.mp_bar.mesh.set_position(0, y);
    this.bars_node.add(this.mp_bar.mesh);

    y = y - 1;
    this.fall_value_bar.mesh.set_position(0, y);
    this.fall_value_bar.set(entity.fall_value, entity.fall_value_max);
    this.bars_node.add(this.fall_value_bar.mesh);

    y = y - 2;
    this.defend_value_bar.mesh.set_position(0, y);
    this.defend_value_bar.set(entity.defend_value, entity.defend_value_max);
    this.bars_node.add(this.defend_value_bar.mesh);

    this.hp_bar.set(entity.hp, entity.hp_max);
    this.mp_bar.set(entity.mp, entity.mp_max);
    this.self_healing_hp_bar.set(entity.hp, entity.hp_max);
    this.self_healing_mp_bar.set(entity.mp, entity.mp_max);

    for (const [k, { node, pos }] of this.key_nodes) {
      node.name = `key ${k}`;
      node.set_position(BAR_BG_W / 2 + pos.x, 10 + pos.y, pos.z)
      lf2.images
        .load_text(Labels[k], {
          fill_style: 'white',
          line_width: 2,
          back_style: {
            stroke_style: 'black',
            line_width: 2,
          },
          smoothing: false,
          padding_l: 5,
          padding_r: 5,
          padding_t: 5,
          padding_b: 5,
          font: "bold 12px Arial",
        })
        .then((i) => lf2.images.p_create_pic_by_img_key(i.key))
        .then((p) => {
          node.set_texture(p)
        });
      this.bars_node.add(node)
    }

  }

  on_mount() {
    const { entity } = this;
    if (entity.in_player_slot)
      (entity.world.renderer as WorldRenderer).scene.add(this.bars_node, this.name_node);
    entity.callbacks.add(this);
    this.update_name_sprite(entity, entity.name, entity.team);
  }

  on_unmount() {
    const { entity } = this;
    this.bars_node.del_self();
    this.name_node.del_self();
    entity.callbacks.del(this);
  }

  on_name_changed(entity: Entity, name: string): void {
    this.update_name_sprite(entity, name, entity.team);
  }

  on_team_changed(entity: Entity, team: string): void {
    this.update_name_sprite(entity, entity.name, team);
  }

  on_hp_changed(_e: Entity, value: number): void {
    this.hp_bar.val = value;
  }
  on_hp_max_changed(_e: Entity, value: number): void {
    this.self_healing_hp_bar.max = value;
  }
  on_mp_changed(_e: Entity, value: number): void {
    this.mp_bar.val = value;
  }
  on_mp_max_changed(_e: Entity, value: number): void {
    this.self_healing_mp_bar.max = value;
  }
  on_hp_r_changed(_e: Entity, value: number): void {
    this.self_healing_hp_bar.val = value;
  }
  on_fall_value_changed(_e: Entity, value: number): void {
    this.fall_value_bar.val = value;
  }
  on_fall_value_max_changed(_e: Entity, value: number): void {
    this.fall_value_bar.max = value;
  }
  on_defend_value_changed(_e: Entity, value: number): void {
    this.defend_value_bar.val = value;
  }
  on_defend_value_max_changed(_e: Entity, value: number): void {
    this.defend_value_bar.max = value;
  }
  on_healing_changed(e: Entity, value: number, prev: number): void {
    this.heading = value;
    this.hp_bar.color = Math.floor(value) % 2 ? "rgb(255, 130, 130)" : "rgb(255,0,0)"
  }
  private update_name_sprite(e: Entity, name: string, team: string) {
    const fillStyle = get_team_text_color(team);
    const strokeStyle = get_team_shadow_color(team);
    const world = e.world;
    const lf2 = world.lf2;
    if (!name) {
      this.name_node.visible = false;
      this.name_node.clear_material().update_material();
      return;
    }
    lf2.images
      .load_text(name, {
        fill_style: fillStyle,
        back_style: {
          stroke_style: strokeStyle,
          line_width: 2
        },
        smoothing: false,
      })
      .then((i) => lf2.images.p_create_pic_by_img_key(i.key))
      .then((p) => {
        if (name !== e.name) return;
        if (team !== e.team) return;
        this.name_node.visible = true;
        this.name_node
          .set_texture(p)
          .update_material()
        this.name_node.name = "name sprite";
      });
  }

  render() {
    const { invisible, position: { x, z, y } } = this.entity;

    this.visible = !invisible;

    const _x = Math.floor(x);
    const name_y = Math.floor(-z / 2 - this.name_node.scale_y);
    this.set_name_position(Math.floor(_x), Math.floor(name_y), Math.floor(z));

    const bar_y = Math.floor(y - z / 2 + 79 + BAR_BG_H + 5);
    const bar_x = _x - BAR_BG_W / 2;

    this.set_bars_position(Math.floor(bar_x), Math.floor(bar_y), Math.floor(z));

    for (const [k, { node }] of this.key_nodes) {
      node.visible = !this.entity.ctrl.is_end(k)
    }
  }

  set_name_position(x: number, y: number, z: number) {
    const hw = (this.name_node.scale_x + 10) / 2;
    const { cam_x: cam_l } = this.entity.world.renderer;
    const cam_r = cam_l + this.entity.world.screen_w;
    if (x + hw > cam_r) x = cam_r - hw;
    else if (x - hw < cam_l) x = cam_l + hw;
    this.name_node.set_position(Math.round(x), Math.round(y), Math.round(z));
  }

  set_bars_position(x?: number, y?: number, z?: number) {
    this.bars_node.set_position(x, y, z);
  }
}
