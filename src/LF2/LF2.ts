import JSZIP from 'jszip';
import * as THREE from 'three';
import Layout from '../Layout/Layout';
import { Log, Warn } from '../Log';
import { arithmetic_progression } from '../common/arithmetic_progression';
import { is_arr } from '../common/is_arr';
import { is_num } from '../common/is_num';
import { is_str } from '../common/is_str';
import { ICharacterData, IStageInfo, IWeaponData, TFace } from '../common/lf2_type';
import { Defines } from '../common/lf2_type/defines';
import random_get from '../common/random_get';
import random_take from '../common/random_take';
import { BgLayer } from './BgLayer';
import { PlayerInfo } from './PlayerInfo';
import Stage from './Stage';
import { World } from './World';
import { KEY_NAME_LIST, TKeys } from './controller/BaseController';
import { PlayerController } from "./controller/LocalHuman";
import './entity/Ball';
import { Character } from './entity/Character';
import { Entity } from './entity/Entity';
import { Weapon } from './entity/Weapon';
import DatMgr from './loader/DatMgr';
import { ImageMgr } from './loader/loader';
import { get_import_fallbacks, import_builtin } from './loader/make_import';
import { new_id, new_team } from './base/new_id';
import { random_in_range } from './base/random_in_range';
import SoundMgr from './sound/SoundMgr';
import { Loader } from './Loader';
import axios from 'axios';
import Callbacks from './base/Callbacks';

const get_short_file_size_txt = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  bytes /= 1024;
  if (bytes < 1024) return `${bytes.toFixed(1).replace('.0', '')}KB`;
  bytes /= 1024;
  if (bytes < 1024) return `${bytes.toFixed(1).replace('.0', '')}MB`;
  bytes /= 1024;
  return `${bytes.toFixed(1).replace('.0', '')}GB`;
}
const default_keys_list: TKeys[] = [
  { L: 'a', R: 'd', U: 'w', D: 's', a: 'r', j: 't', d: 'y' },
  { L: 'j', R: 'l', U: 'i', D: 'k', a: '[', j: ']', d: '\\' },
  { L: 'arrowleft', R: 'arrowright', U: 'arrowup', D: 'arrowdown', a: '0', j: '.', d: 'enter' },
  { L: '4', R: '6', U: '8', D: '5', a: '/', j: '*', d: '-' },
  { L: '', R: '', U: '', D: '', a: '', j: '', d: '' }
]
const get_default_keys = (i: number) => default_keys_list[i] || default_keys_list[default_keys_list.length - 1];


export interface ILf2Callback {
  on_layout_changed?(layout: Layout | undefined, prev_layout: Layout | undefined): void;
  on_loading_start?(): void;
  on_loading_end?(): void;
  on_loading_content?(content: string, progress: number): void;

  on_stages_loaded?(stages: IStageInfo[]): void;
  on_stages_clear?(): void;
  on_bgms_loaded?(names: string[]): void;
  on_bgms_clear?(): void;
}
export default class LF2 {
  readonly callbacks = new Callbacks<ILf2Callback>();
  private _disposers = new Set<() => void>();
  private _disposed: boolean = false;
  private _layout: Layout | undefined;
  static DisposeError = new Error('disposed')
  static IngoreDisposeError = (e: any) => { if (e !== this.DisposeError) throw e; }
  private _loading: boolean = false;
  private _loaded: boolean = false;

  get loading() { return this._loading; }
  get loaded() { return this._loaded; }
  get need_load() { return !this._loaded && !this._loading; }

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
  private _player_infos = new Map([
    ['1', new PlayerInfo('1', '1', get_default_keys(0))],
    ['2', new PlayerInfo('2', '2', get_default_keys(1))],
    ['3', new PlayerInfo('3', '3', get_default_keys(2))],
    ['4', new PlayerInfo('4', '4', get_default_keys(3))]
  ])
  get player_infos() { return this._player_infos }

  get players() { return this.world.players }
  get layout() { return this._layout }

  private _bgm_enable = false;
  get bgm_enable() { return this._bgm_enable; }
  set_bgm_enable(enabled: boolean): void {
    this._bgm_enable = enabled;
    this.world.stage.set_bgm_enable(enabled);
  }

  readonly stages = new Loader<IStageInfo[]>(
    async () => [Defines.THE_VOID_STAGE, ...await this.import('data/stage.json')],
    (d) => this.callbacks.emit('on_stages_loaded')(d),
    () => this.callbacks.emit('on_stages_clear')()
  )

  readonly bgms = new Loader<string[]>(() => {
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
      const src = this.import('bgm/' + name)
      await this.sound_mgr.preload(name, src);
      return name;
    }))
    return Promise.all(
      this.zip.file(/^bgm\//).map(async file => {
        await this.sound_mgr.preload(file.name, file.async('blob'))
        return file.name
      })
    )
  },
    (d) => this.callbacks.emit('on_bgms_loaded')(d),
    () => this.callbacks.emit('on_bgms_clear')()
  );


  get_local_player(which: string) {
    for (const [id, player] of this.players)
      if (id === which) return player;
  }
  on_click_character?: (c: Character) => void;

  _r = (r: any) => this._disposed ? Promise.reject(LF2.DisposeError) : r;


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
  readonly img_mgr: ImageMgr
  constructor(canvas: HTMLCanvasElement, overlay?: HTMLDivElement | null) {
    this.canvas = canvas;
    this.world = new World(this, canvas, overlay);
    this.dat_mgr = new DatMgr(this);
    this.sound_mgr = new SoundMgr(this);
    this.img_mgr = new ImageMgr(this);
    this.overlay = overlay;
    this.canvas.addEventListener('click', this.on_click);
    this.canvas.addEventListener('mousemove', this.on_mouse_move);
    this.canvas.addEventListener('pointerdown', this._on_pointer_down);
    this.canvas.addEventListener('pointerup', this._on_pointer_up);
    window.addEventListener('keydown', this._on_key_down);
    window.addEventListener('keyup', this._on_key_up);

    this.disposer = () => window.removeEventListener('keydown', this._on_key_down)
    this.disposer = () => window.removeEventListener('keyup', this._on_key_up)
    this.disposer = () => this.canvas.removeEventListener('click', this.on_click)
    this.disposer = () => this.canvas.removeEventListener('mousemove', this.on_mouse_move)
    this.disposer = () => this.canvas.removeEventListener('pointerdown', this._on_pointer_down)
    this.disposer = () => this.canvas.removeEventListener('pointerup', this._on_pointer_up)
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
    if (!this._layout) return;
    const coords = this.get_game_sceen_pos(e);
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
    const coords = this.get_game_sceen_pos(e);
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

  get_game_sceen_pos(e: PointerEvent | MouseEvent) {
    const { offsetX: x, offsetY: y } = e;
    const { width, height } = this.canvas.getBoundingClientRect();

    return new THREE.Vector2(
      (x / width) * 2 - 1,
      -(y / height) * 2 + 1
    )

  }
  private _on_pointer_down = (e: PointerEvent) => {
    const coords = this.get_game_sceen_pos(e);
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

  private _on_pointer_up = () => { }

  private _on_key_down = (e: KeyboardEvent) => {
    e.key.toLowerCase()
    for (const k of KEY_NAME_LIST) {
      for (const [, player_info] of this._player_infos) {
        if (player_info.keys[k] === e.key.toLowerCase()) {
          this.layout?.on_player_key_down(k); return;
        }
      }
    }
  }
  private _on_key_up = (e: KeyboardEvent) => {

  }

  remove_all_entities() {
    this.world.del_entities(...this.world.entities);
    this.world.del_game_objs(...this.world.game_objs);
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

  load(arg1?: JSZIP | string): Promise<void> {
    this.on_loading_start();
    this.set_layout("loading");

    if (is_str(arg1)) {
      return this.download_zip(arg1)
        .then(r => {
          this.zip = r;
          return this.load_data()
        }).then(() => this.on_loading_end())
    }

    if (arg1) this.zip = arg1
    return this.load_data().then(() => this.on_loading_end())
  }

  private async download_zip(zip: string) {
    const resp = await axios.get('lf2.data.zip', {
      responseType: 'blob', onDownloadProgress: (e) => {
        const progress = e.total ? Math.round(100 * e.loaded / e.total) : 100;
        const full_size = get_short_file_size_txt(e.total ?? e.loaded);
        let txt = `download: ${zip}(${full_size})`;
        if (e.total) txt += ',' + progress + '%'
        this.on_loading_content(txt, progress);
      }
    });
    return await JSZIP.loadAsync(resp.data);
  }

  private async load_data() {
    await this.dat_mgr.load();
    for (const d of this.dat_mgr.characters) {
      const name = d.base.name.toLowerCase();
      this.characters[`add_${name}`] = (num = 1, team = void 0) => this.add_character(d, num, team);
    }
    for (const d_1 of this.dat_mgr.weapons) {
      const name_1 = d_1.base.name.toLowerCase();
      this.weapons[`add_${name_1}`] = (num_1 = 1, team_1 = void 0) => this.add_weapon(d_1, num_1, team_1);
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

  add_player = (which: string, character_id: string) => {

    const player_info = this.player_infos.get(which);
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
    player.controller = new PlayerController(which, player, player_info?.keys)
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

  change_stage(stage_info: IStageInfo): void
  change_stage(stage_id: string): void

  change_stage(arg: IStageInfo | string): void {
    if (is_str(arg)) {
      const stage_info = this.stages.data?.find(v => v.id === arg)
      if (stage_info) this.change_stage(stage_info)
    } else {
      this.world.stage = new Stage(this.world, arg)
    }
  }
  remove_stage() {
    this.world.stage = new Stage(this.world, Defines.THE_VOID_STAGE)
  }

  private _layouts?: Layout[];
  async layouts(): Promise<Layout[] | undefined> {
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
      return (item.state.mouse_on_me === '1' || item.focused_item === item) ? 1 : 0.5;
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
          const on_me = (item.state.mouse_on_me === '1' || item.focused_item === item)
          item.set_opacity_animation(!on_me, begin, end, duration);
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
    const prev_layout = this._layout;
    this._layout?.on_unmount();
    this._layout = layout;
    this._layout?.on_mount();
    this.world.start_render();
    this.callbacks.emit('on_layout_changed')(layout, prev_layout)
  }

  on_loading_content(content: string, progress: number) {
    this.callbacks.emit('on_loading_content')(content, progress);
  }
  on_loading_end() {
    this._loaded = true;
    this._loading = false;
    this.callbacks.emit('on_loading_end')();
  }
  on_loading_start() {
    this._loading = true;
    this.callbacks.emit('on_loading_start')();
  }
}