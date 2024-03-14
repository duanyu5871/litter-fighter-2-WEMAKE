import * as THREE from 'three';
import { BgLayer } from './G/BgLayer';
import Stage from './G/Stage';
import { World } from './G/World';
import { PlayerController } from "./G/controller/PlayerController";
import './G/entity/Ball';
import { Character } from './G/entity/Character';
import { Entity } from './G/entity/Entity';
import { Weapon } from './G/entity/Weapon';
import DatMgr from './G/loader/DatMgr';
import { Log } from './Log';
import random_get from './Utils/random_get';
import { is_num } from './js_utils/is_num';
import { ICharacterData, IWeaponData, TFace } from './js_utils/lf2_type';
import { Defines } from './js_utils/lf2_type/defines';
let _new_id = 0;
const new_id = () => '' + (++_new_id);

export default class LF2 {
  private readonly _disposers: (() => void)[] = []
  readonly canvas: HTMLCanvasElement;
  readonly world: World;
  readonly overlay: HTMLDivElement | null | undefined;
  set on_stage_change(v: World['on_stage_change']) { this.world.on_stage_change = v }

  private _local_players = new Map<string, Character>();
  get_local_player(which: string) {
    return this._local_players.get(which)
  }
  on_click_character?: (c: Character) => void;

  readonly characters: Record<string, (num: number, team?: number) => void> = {}
  readonly weapons: Record<string, (num: number, team?: number) => void> = {}
  readonly dat_mgr: DatMgr;

  constructor(canvas: HTMLCanvasElement, overlay?: HTMLDivElement | null) {
    this.canvas = canvas;
    this.world = new World(this, canvas, overlay);
    this.dat_mgr = new DatMgr();
    this.overlay = overlay
  }
  random_entity_info(e: Entity) {
    const { left: l, right: r, near: n, far: f } = this.world;
    const rand = () => Math.random();
    e.id = new_id();
    e.facing = Math.floor(rand() * 100) % 2 ? -1 : 1
    e.position.x = l + rand() * (r - l);
    e.position.z = f + rand() * (n - f);
    e.position.y = 550;
    return e;
  }
  add_character(d: ICharacterData, team?: number) {
    const e = new Character(this.world, d);
    if (is_num(team)) e.team = team;
    this.random_entity_info(e).attach();
  }
  add_weapon(d: IWeaponData, team?: number) {
    const e = new Weapon(this.world, d);
    if (is_num(team)) e.team = team;
    this.random_entity_info(e).attach();
  }
  on_key_down = (e: KeyboardEvent) => {
    const interrupt = () => {
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    switch (e.key?.toUpperCase()) {
      case 'F2':
        interrupt();
        if (!this.world.paused) this.world.paused = true;
        else this.world.update_once()
        break;
      case 'F1':
        interrupt();
        this.world.paused = !this.world.paused;
        break;
      case 'F5':
        interrupt();
        this.world.playrate = this.world.playrate === 100 ? 1 : 100;
        break;
      case 'F6':
        interrupt();
        this.world.show_indicators = !this.world.show_indicators;
        break;
    }
  }

  private _intersection: THREE.Intersection | undefined = void 0;

  pick_intersection(next: THREE.Intersection | undefined) {
    const old = this._intersection;
    if (old) {
      const o = old.object;
      if (o.userData.owner instanceof BgLayer)
        o.userData.owner.show_indicators = false;
      else if (o.userData.owner instanceof Entity)
        o.userData.owner.show_indicators = false;
      else if (o instanceof THREE.Mesh)
        o.material.color.set(0xffffff)
      else if (o instanceof THREE.Sprite)
        o.material.color.set(0xffffff)
    }
    this._intersection = next;
    (window as any).pick_0 = void 0
    if (!next) return;
    const o = next.object;
    (window as any).pick_0 = o.userData.owner ?? o.userData
    Log.print("click", o.userData.owner ?? o.userData)
    if (o.userData.owner instanceof BgLayer)
      o.userData.owner.show_indicators = true;
    else if (o.userData.owner instanceof Entity) {
      o.userData.owner.show_indicators = true;
      if (o.userData.owner instanceof Character) {
        this.on_click_character?.(o.userData.owner)
      }
    } else if (o instanceof THREE.Mesh) {
      o.material.color.set(0xff0000)
    } else if (o instanceof THREE.Sprite) {
      o.material.color.set(0xff0000)
    }
  }

  on_pointer_down = (e: PointerEvent) => {
    const { offsetX: x, offsetY: y } = e;
    const coords = new THREE.Vector2(
      (x / this.canvas.width) * 2 - 1,
      -(y / this.canvas.height) * 2 + 1
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(coords, this.world.camera)
    const intersections = raycaster.intersectObjects(this.world.scene.children);
    if (!intersections.length) {
      this.pick_intersection(void 0)
    } else {
      if (this._intersection) {
        const idx = intersections.findIndex(v => v.object === this._intersection?.object);
        const iii = intersections.find((v, i) => i > idx && v.object.userData.owner);
        this.pick_intersection(iii)
      } else {
        const iii = intersections.find(v => v.object.userData.owner)
        this.pick_intersection(iii)
      }
    }
  }

  on_pointer_up = () => { }

  clear() {
    this.world.del_entities(...this.world.entities)
  }
  add_random_weapon(num = 1) {
    while (--num >= 0) {
      const d = random_get(this.dat_mgr.weapons);
      const e = new Weapon(this.world, d)
      this.random_entity_info(e).attach();
    }
  }
  add_random_character(count = 1, team = void 0) {
    while (--count >= 0) this.add_character(random_get(this.dat_mgr.characters), team)
  }
  async start() {
    await this.dat_mgr.load();
    for (const d of this.dat_mgr.characters) {
      const name = d.base.name.toLowerCase();
      this.characters[`add_${name}`] = (num = 1, team = void 0) => {
        while (--num >= 0) this.add_character(d, team);
      }
    }
    for (const d of this.dat_mgr.weapons) {
      const name = d.base.name.toLowerCase();
      this.weapons[`add_${name}`] = (num = 1, team = void 0) => {
        while (--num >= 0) this.add_weapon(d, team)
      }
    }
    this.world.start_update();
    this.world.start_render();
    this.canvas.addEventListener('pointerdown', this.on_pointer_down);
    this.canvas.addEventListener('pointerup', this.on_pointer_up);
    window.addEventListener('keydown', this.on_key_down);
    this._disposers.push(
      () => this.canvas.removeEventListener('pointerdown', this.on_pointer_down),
      () => this.canvas.removeEventListener('pointerup', this.on_pointer_up),
      () => window.removeEventListener('keydown', this.on_key_down)
    )
  }
  dispose() {
    for (const f of this._disposers) f();
    this.world.dispose()
    this.dat_mgr.cancel();
  }
  add_player = (which: string, character_id: string) => {
    const data = this.dat_mgr.characters.find(v => v.id === character_id)
    if (!data) return;
    let x = 0;
    let y = 0;
    let z = 0;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    let face: TFace = 1;
    let frame_id: string | undefined;
    let player_name: string | undefined;
    const old = this._local_players.get(which);
    if (old) {
      x = old.position.x;
      y = old.position.y;
      z = old.position.z;
      vx = old.velocity.x;
      vy = old.velocity.y;
      vz = old.velocity.z;
      face = old.facing;
      player_name = old.name;
      frame_id = old.get_frame().id;
      old.dispose()
    }

    const player = new Character(this.world, data)
    player.id = old?.id ?? new_id();

    player.position.x = x;
    player.position.y = y;
    player.position.z = z;
    player.velocity.x = vx;
    player.velocity.y = vy;
    player.velocity.z = vz;
    player.facing = face;
    player.name = player_name ?? which;
    player.enter_frame(frame_id ?? Defines.ReservedFrameId.Auto);
    if (!old) {
      this.random_entity_info(player)
    }
    player.controller = new PlayerController(player)
    player.attach();

    this._local_players.set(which, player)
    return player
  }
  remove_player = (which: string) => {
    const old = this._local_players.get(which);
    if (old) old.dispose();
    this._local_players.delete(which);
  }
  change_bg = (bg_id: string) => {
    const data = this.dat_mgr.backgrounds.find(v => v.id == bg_id);
    if (!data) return;
    this.world.stage = new Stage(this.world, data)
  }
}
