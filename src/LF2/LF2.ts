import JSZIP from 'jszip';
import * as THREE from 'three';
import { Layout } from '../Layout';
import { Log, Warn } from '../Log';
import random_get from '../Utils/random_get';
import random_take from '../Utils/random_take';
import { is_arr } from '../is_arr';
import { arithmetic_progression } from '../js_utils/arithmetic_progression';
import { is_num } from '../js_utils/is_num';
import { is_str } from '../js_utils/is_str';
import { ICharacterData, IStageInfo, IWeaponData, TFace } from '../js_utils/lf2_type';
import { Defines } from '../js_utils/lf2_type/defines';
import { BgLayer } from './BgLayer';
import Stage from './Stage';
import { World } from './World';
import { TKeyName, TKeys } from './controller/BaseController';
import { PlayerController } from "./controller/LocalHuman";
import './entity/Ball';
import { Character } from './entity/Character';
import { Entity } from './entity/Entity';
import { Weapon } from './entity/Weapon';
import DatMgr from './loader/DatMgr';
import { SoundMgr } from './loader/SoundMgr';
import { get_import_fallbacks, import_builtin } from './loader/make_import';
import { new_id, new_team } from './new_id';
import { random_in_range } from './random_in_range';

const default_keys_list: TKeys[] = [
  { L: 'a', R: 'd', U: 'w', D: 's', a: 'r', j: 't', d: 'y' },
  { L: 'j', R: 'l', U: 'i', D: 'k', a: '[', j: ']', d: '\\' },
  { L: 'arrowleft', R: 'arrowright', U: 'arrowup', D: 'arrowdown', a: '0', j: '.', d: 'Enter' },
  { L: '4', R: '6', U: '8', D: '5', a: '/', j: '*', d: '-' },
  { L: '', R: '', U: '', D: '', a: '', j: '', d: '' }
]
const get_default_keys = (i: number) => default_keys_list[i] || default_keys_list[default_keys_list.length - 1];

class PlayerInfo {
  private _name: string;
  private _keys: TKeys;
  constructor(name: string, keys: TKeys) {
    this._name = name;
    this._keys = keys;
  }
}

export default class LF2 {
  private _disposers = new Set<() => void>();
  private _stage_infos: IStageInfo[] = [];
  private _disposed: boolean = false;
  private _layout: Layout | undefined;
  static DisposeError = new Error('disposed')
  static IngoreDisposeError = (e: any) => { if (e !== this.DisposeError) throw e; }

  set disposer(f: (() => void)[] | (() => void)) {
    if (Array.isArray(f))
      for (const i of f) this._disposers.add(i);
    else
      this._disposers.add(f);
  }

  readonly canvas: HTMLCanvasElement;
  readonly world: World;
  readonly overlay: HTMLDivElement | null | undefined;
  private zip: JSZIP | undefined;

  private _player_infos: PlayerInfo[] = [
    new PlayerInfo('1', get_default_keys(0)),
    new PlayerInfo('2', get_default_keys(1)),
    new PlayerInfo('3', get_default_keys(2)),
    new PlayerInfo('4', get_default_keys(3))
  ]
  get player_infos() { return this._player_infos }

  get players() { return this.world.players }
  get layout() { return this._layout }

  private _bgm_enable = false;
  get bgm_enable() { return this._bgm_enable; }
  set_bgm_enable(enabled: boolean): void {
    this._bgm_enable = enabled;
    this.world.stage.set_bgm_enable(enabled);
  }

  get stage_infos() { return this._stage_infos }

  get_local_player(which: string) {
    for (const [id, player] of this.players)
      if (id === which) return player;
  }
  on_click_character?: (c: Character) => void;

  _r = (r: any) => this._disposed ? Promise.reject(LF2.DisposeError) : r;

  @Log.Clone({ showArgs: true, showRet: false, disabled: true })
  async import(path: string) {
    const fallback_paths = get_import_fallbacks(path);
    if (this.zip) {
      for (const fallback_path of fallback_paths) {
        const zip_obj = this.zip.file(fallback_path);
        if (!zip_obj) continue;
        if (fallback_path.endsWith('.json')) {
          const ret = await zip_obj.async('text').then(JSON.parse);
          return this._r(ret);
        }
        if (fallback_path.endsWith('.txt')) {
          const ret = await zip_obj.async('text');
          return this._r(ret);
        }
        const ret = await zip_obj.async('blob')
        return this._r(ret);
      }
    }
    for (const fallback_path of fallback_paths) {
      try {
        const ret = await import_builtin(fallback_path);
        return this._r(ret);
      } catch (e) {
        console.error(e);
      }
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
    this.overlay = overlay;
    this.canvas.addEventListener('click', this.on_click);
    this.canvas.addEventListener('mousemove', this.on_mouse_move);
    this.canvas.addEventListener('pointerdown', this.on_pointer_down);
    this.canvas.addEventListener('pointerup', this.on_pointer_up);
    this.disposer = () => this.canvas.removeEventListener('click', this.on_click)
    this.disposer = () => this.canvas.removeEventListener('mousemove', this.on_mouse_move)
    this.disposer = () => this.canvas.removeEventListener('pointerdown', this.on_pointer_down)
    this.disposer = () => this.canvas.removeEventListener('pointerup', this.on_pointer_up)
  }

  private _stages?: IStageInfo[];
  async stages(): Promise<IStageInfo[]> {
    if (this._stages) return this._stages
    return this._stages = await this.import('data/stage.json')
  }

  private _bgms?: string[];
  async bgms(): Promise<string[]> {

    if (this._bgms) return this._bgms;

    if (!this.zip) return this._bgms = await Promise.all([
      "boss1.wma.ogg",
      "boss2.wma.ogg",
      "main.wma.ogg",
      "stage1.wma.ogg",
      "stage2.wma.ogg",
      "stage3.wma.ogg",
      "stage4.wma.ogg",
      "stage5.wma.ogg",
    ].map(async name => {
      const src = this.import('bgm/' + name)
      await this.sound_mgr.load(name, src);
      return name;
    }))

    return this._bgms = await Promise.all(
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
      e.team = team ?? new_team();
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
    }
  }
  private mouse_on_layouts = new Set<Layout>()
  on_click = (e: MouseEvent) => {
    console.log(e);
    if (!this._layout) return;
    const { offsetX: x, offsetY: y } = e;
    const coords = new THREE.Vector2(
      (x / this.canvas.width) * 2 - 1,
      -(y / this.canvas.height) * 2 + 1
    )
    const { sprite: object_3d } = this._layout;
    if (!object_3d) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(coords, this.world.camera);
    const intersections = raycaster.intersectObjects([object_3d], true);

    const layouts = intersections
      .filter(v => v.object.userData.owner instanceof Layout)
      .map(v => v.object.userData.owner as Layout)
      .sort((a, b) => {
        if (b.level > a.level) {
          do { if (!b.parent) return 0; b = b.parent; } while (b.level !== a.level)
        }
        if (a.level < b.level) {
          do { if (!a.parent) return 0; a = a.parent; } while (b.level !== a.level)
        }
        return b.z_order - a.z_order || b.index - a.index;
      })


    for (const layout of layouts)
      if (layout.on_click()) break;

  }

  on_mouse_move = (e: MouseEvent) => {
    if (!this._layout) return;
    const { offsetX: x, offsetY: y } = e;
    const coords = new THREE.Vector2(
      (x / this.canvas.width) * 2 - 1,
      -(y / this.canvas.height) * 2 + 1
    )
    const { sprite: object_3d } = this._layout;
    if (!object_3d) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(coords, this.world.camera);
    const intersections = raycaster.intersectObjects([object_3d], true);
    const mouse_on_layouts = new Set<Layout>()
    for (const { object: { userData: { owner } } } of intersections) {
      if (owner instanceof Layout) mouse_on_layouts.add(owner);
    }
    for (const layout of mouse_on_layouts) {
      if (!this.mouse_on_layouts.has(layout)) {
        layout.on_mouse_enter()
        layout.state.mouse_on_me = '1';
      }
    }
    for (const layout of this.mouse_on_layouts) {
      if (!mouse_on_layouts.has(layout)) {
        layout.on_mouse_leave()
        layout.state.mouse_on_me = '0';
      }
    }
    this.mouse_on_layouts = mouse_on_layouts;
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
  }
  dispose() {
    this._disposed = true;
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

  private _layouts?: Layout[];
  async layouts() {
    if (this._layouts) return this._layouts;

    const array = await this.import('layouts/index.json');
    if (!is_arr(array)) return;

    const paths: string[] = [];
    for (const element of array) {
      if (is_str(element)) paths.push(element);
      else Warn.print('layouts/index.json', 'element is not a string! got:', element)
    }

    const cooked_layouts: Layout[] = [];
    for (const path of paths) {
      const raw_layout = await this.import(path);
      const cooked_layout = await Layout.cook(this, raw_layout, this.layout_val_getter)
      cooked_layouts.push(cooked_layout);
    }
    return this._layouts = cooked_layouts;
  }

  layout_val_getter = (word: string) => (item: Layout) => {
    if (word === 'mouse_on_me')
      return item.state.mouse_on_me;
    if (word === 'opacity_hover')
      return item.state.mouse_on_me === '1' ? 1 : 0.5;
    if (word.startsWith('f:')) {
      let result = word.match(/f:random_int_in_range\((\d+),(\d+),?(\d+)?\)/);
      if (result) {
        const [, a, b, group_id] = result;
        const begin = Number(a);
        const end = Number(b);
        if (begin > end) return end;
        const { img_idx } = item.state;
        if (is_num(img_idx)) return img_idx
        if (is_str(group_id) && item.parent) {
          let arr = item.parent.state['random_int_arr' + group_id];
          if (!is_arr(arr) || !arr.length)
            arr = item.parent.state['random_int_arr' + group_id] = arithmetic_progression(begin, end, 1);
          return item.state.img_idx = random_take(arr);
        } else {
          return item.state.img_idx = Math.floor(random_in_range(begin, end) % (end + 1))
        }
      }

      result = word.match(/f:opacity_hover\((\S+),(\S+),?(\S+)?\)/);
      if (result) {
        const [, a, b, c] = result;
        const begin = Number(a);
        const end = Number(b);
        const duration = Number(c);
        if (begin >= 0 && end >= 0) {
          const on_me = item.state.mouse_on_me === '1'
          item.set_opacity_animation(on_me, begin, end, duration);
          return -1;
        }
        return 1;
      }
    }
    return word;
  };

  set_layout(layout?: Layout): void;
  set_layout(id?: string): void;
  set_layout(any: string | Layout | undefined): void {
    const layout = typeof any === 'string' ? this._layouts?.find(v => v.data.id === any) : any;
    if (this._layout === layout) return;
    this._layout?.on_unmount();
    this._layout = layout;
    this._layout?.on_mount();
    this.world.start_render();
  }
}