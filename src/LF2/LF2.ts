import JSZIP from 'jszip';
import * as THREE from 'three';
import { Log } from '../Log';
import random_get from '../Utils/random_get';
import { is_num } from '../js_utils/is_num';
import { ICharacterData, IStageInfo, IWeaponData, TFace } from '../js_utils/lf2_type';
import { Defines } from '../js_utils/lf2_type/defines';
import { BgLayer } from './BgLayer';
import Stage from './Stage';
import { World } from './World';
import { PlayerController } from "./controller/LocalHuman";
import './entity/Ball';
import { Character } from './entity/Character';
import { Entity } from './entity/Entity';
import { Weapon } from './entity/Weapon';
import DatMgr from './loader/DatMgr';
import { SoundMgr } from './loader/SoundMgr';
import { get_import_fallbacks as get_import_fallback_names, import_builtin } from './loader/make_import';
import { new_id } from './new_id';
import { TKeyName } from './controller/BaseController';

export default class LF2 {

  private _disposers = new Set<() => void>();
  private _stage_infos: IStageInfo[] = [];

  set disposer(f: (() => void)[] | (() => void)) {
    if (Array.isArray(f))
      for (const i of f) this._disposers.add(i);
    else
      this._disposers.add(f);
  }

  readonly canvas: HTMLCanvasElement;
  readonly world: World;
  readonly overlay: HTMLDivElement | null | undefined;
  zip: JSZIP | undefined;

  get players() { return this.world.players }

  private _stage_bgm_enable = false;


  get stage_infos() { return this._stage_infos }
  get stage_bgm_enable() { return this._stage_bgm_enable; }

  set_stage_bgm_enable(enabled: boolean): void {
    this._stage_bgm_enable = enabled;
    this.world.stage.set_bgm_enable(enabled);
  }
  get_local_player(which: string) {
    for (const [id, player] of this.players)
      if (id === which) return player;
  }
  on_click_character?: (c: Character) => void;

  @Log.Clone({ showArgs: true, showRet: false, disabled: true })
  async import(path: string) {
    const fallback_paths = get_import_fallback_names(path);
    if (this.zip) {
      for (const fallback_path of fallback_paths) {
        const zip_obj = this.zip.file(fallback_path);
        if (!zip_obj) continue;
        if (fallback_path.endsWith('.json'))
          return await zip_obj.async('text').then(JSON.parse)
        if (fallback_path.endsWith('.txt'))
          return await zip_obj.async('text');
        return await zip_obj.async('blob')
      }
    }
    for (const fallback_path of fallback_paths) {
      try { return await import_builtin(fallback_path) } catch { }
    }
    throw new Error(`resource not found, path: ${path}, fallbacks: ${fallback_paths.join(';')}!`)
  }
  readonly characters: Record<string, (num: number, team?: number) => void> = {}
  readonly weapons: Record<string, (num: number, team?: number) => void> = {}
  readonly dat_mgr: DatMgr;
  readonly sound_mgr: SoundMgr;
  constructor(canvas: HTMLCanvasElement, overlay?: HTMLDivElement | null) {
    this.canvas = canvas;
    this.world = new World(this, canvas, overlay);
    this.dat_mgr = new DatMgr(this);
    this.sound_mgr = new SoundMgr(this);
    this.overlay = overlay
  }

  async stages(): Promise<IStageInfo[]> {
    const ret: IStageInfo[] = await import_builtin('data/stage.json');
    for (const a of ret) {
      for (const b of a.phases) {
        for (const c of b.objects) {

        }
      }
    }
    return ret;
  }
  async bgms(): Promise<string[]> {
    if (!this.zip) return Promise.all([
      "boss1.wma.ogg",
      "boss2.wma.ogg",
      "main.wma.ogg",
      "stage1.wma.ogg",
      "stage2.wma.ogg",
      "stage3.wma.ogg",
      "stage4.wma.ogg",
      "stage5.wma.ogg",
    ].map(async name => {
      const src = import_builtin('bgm/' + name)
      await this.sound_mgr.load(name, src);
      return name;
    }))

    return Promise.all(
      this.zip.file(/^bgm\//).map(async file => {
        const src = file.async('blob');
        await this.sound_mgr.load(file.name, src)
        return file.name
      })
    )
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
  add_character(data: ICharacterData, num: number, team?: number): Character[];
  add_character(id: string, num: number, team?: number): Character[];
  add_character(data: ICharacterData | string, num: number, team?: number): Character[] {
    if (typeof data === 'string') {
      let d = this.dat_mgr.characters.find(v => v.id === data)
      if (!d) return [];
      data = d
    }
    const ret: Character[] = []
    while (--num >= 0) {
      const e = new Character(this.world, data);
      e.team = team ?? Entity.new_team();
      this.random_entity_info(e).attach();
      ret.push(e)
    }
    return ret;
  }

  add_weapon(data: IWeaponData, num: number, team?: number): Weapon[];
  add_weapon(id: string, num: number, team?: number): Weapon[];
  add_weapon(data: IWeaponData | string, num: number, team?: number): Weapon[] {
    if (typeof data === 'string') {
      let d = this.dat_mgr.weapons.find(v => v.id === data)
      if (!d) return [];
      data = d
    }
    const ret: Weapon[] = []
    while (--num >= 0) {
      const e = new Weapon(this.world, data);
      if (is_num(team)) e.team = team;
      this.random_entity_info(e).attach();
      ret.push(e);
    }
    return ret;
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
  add_random_weapon(num = 1): Weapon[] {
    const ret: Weapon[] = []
    while (--num >= 0) {
      ret.push(
        ...this.add_weapon(random_get(this.dat_mgr.weapons), 1)
      )
    }
    return ret;
  }
  add_random_character(num = 1, team?: number): Character[] {
    const ret: Character[] = []
    while (--num >= 0) {
      ret.push(
        ...this.add_character(random_get(this.dat_mgr.characters), 1, team)
      )
    }
    return ret;
  }
  async start(zip?: JSZIP) {
    this.zip = zip
    await this.dat_mgr.load();

    const stage_infos: IStageInfo[] = await import_builtin('data/stage.json');
    for (const a of stage_infos) {
      for (const b of a.phases) {
        for (const c of b.objects) {
          c.id = c.id.filter(v => this.dat_mgr.find(v))
        }
      }
    }
    this._stage_infos = stage_infos;

    for (const d of this.dat_mgr.characters) {
      const name = d.base.name.toLowerCase();
      this.characters[`add_${name}`] = (num = 1, team = void 0) => {
        this.add_character(d, num, team);
      }
    }
    for (const d of this.dat_mgr.weapons) {
      const name = d.base.name.toLowerCase();
      this.weapons[`add_${name}`] = (num = 1, team = void 0) => {
        this.add_weapon(d, num, team)
      }
    }
    this.world.start_update();
    this.world.start_render();
    this.canvas.addEventListener('pointerdown', this.on_pointer_down);
    this.canvas.addEventListener('pointerup', this.on_pointer_up);
    this.disposer = () => this.canvas.removeEventListener('pointerdown', this.on_pointer_down)
    this.disposer = () => this.canvas.removeEventListener('pointerup', this.on_pointer_up)

  }
  dispose() {
    for (const f of this._disposers) f();
    this.world.dispose()
    this.dat_mgr.cancel();
  }
  add_player = (which: string, character_id: string, kc?: Record<TKeyName, string>) => {
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
    const old = this.players.get(which);
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
      this.world.del_entities(old);
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
    player.controller = new PlayerController(which, player, kc)
    player.attach();
    return player
  }
  remove_player = (which: string) => {
    const old = this.players.get(which);
    if (old) this.world.del_entities(old)
  }
  change_bg = (bg_id: string) => {
    const data = this.dat_mgr.backgrounds.find(v => v.id == bg_id);
    if (!data) return;
    this.world.stage = new Stage(this.world, data)
  }
  remove_bg = () => this.remove_stage();
  change_stage = (stage_info: IStageInfo) => {
    this.world.stage = new Stage(this.world, stage_info)
  }
  remove_stage() {
    this.world.stage = new Stage(this.world, Defines.THE_VOID_STAGE)
  }
}

