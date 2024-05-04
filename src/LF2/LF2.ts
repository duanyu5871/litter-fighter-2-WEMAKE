import axios from 'axios';
import JSZIP from 'jszip';
import * as THREE from 'three';
import Layout from '../Layout/Layout';
import { Log, Warn } from '../Log';
import { arithmetic_progression } from '../common/arithmetic_progression';
import { is_arr } from '../common/is_arr';
import { is_num } from '../common/is_num';
import { is_str } from '../common/is_str';
import { ICharacterData, IWeaponData, TFace } from '../common/lf2_type';
import { IStageInfo } from "../common/lf2_type/IStageInfo";
import { Defines } from '../common/lf2_type/defines';
import random_get from '../common/random_get';
import random_take from '../common/random_take';
import { ILf2Callback } from './ILf2Callback';
import { Loader } from './Loader';
import { PlayerInfo } from './PlayerInfo';
import { World } from './World';
import Callbacks, { NoEmitCallbacks } from './base/Callbacks';
import { get_short_file_size_txt } from './base/get_short_file_size_txt';
import { new_id, new_team } from './base/new_id';
import { random_in_range } from '../common/random_in_range';
import Layer from './bg/Layer';
import { KEY_NAME_LIST } from './controller/BaseController';
import { LocalHuman } from "./controller/LocalHuman";
import { IKeyboardCallback, KeyEvent, Keyboard } from './dom/Keyboard';
import Pointings, { IPointingsCallback, PointingEvent } from './dom/Pointings';
import './entity/Ball';
import { Character } from './entity/Character';
import { Entity } from './entity/Entity';
import { Weapon } from './entity/Weapon';
import DatMgr from './loader/DatMgr';
import { ImageMgr } from './loader/loader';
import { get_import_fallbacks, import_builtin } from './loader/make_import';
import SoundMgr from './sound/SoundMgr';
import Stage from './stage/Stage';

const cheat_info_pair = (n: Defines.Cheats) => ['' + n, {
  keys: Defines.CheatKeys[n],
  sound: Defines.CheatSounds[n],
}] as const;

export default class LF2 implements IKeyboardCallback, IPointingsCallback {
  private _callbacks = new Callbacks<ILf2Callback>();
  private _disposers = new Set<() => void>();
  private _disposed: boolean = false;
  private _layout: Layout | undefined;
  static DisposeError = new Error('disposed')
  static IngoreDisposeError = (e: any) => { if (e !== this.DisposeError) throw e; }
  private _loading: boolean = false;
  private _loaded: boolean = false;
  get callbacks(): NoEmitCallbacks<ILf2Callback> { return this._callbacks }
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
    ['1', new PlayerInfo('1')],
    ['2', new PlayerInfo('2')],
    ['3', new PlayerInfo('3')],
    ['4', new PlayerInfo('4')]
  ])
  get player_infos() { return this._player_infos }

  get player_characters() { return this.world.player_characters }
  get layout() { return this._layout }

  private _bgm_enable = false;
  get bgm_enable() { return this._bgm_enable; }
  set_bgm_enable(enabled: boolean): void {
    this._bgm_enable = enabled;
    this.world.stage.set_bgm_enable(enabled);
  }

  readonly stages = new Loader<IStageInfo[]>(
    async () => [Defines.THE_VOID_STAGE, ...await this.import('data/stage.json')],
    (d) => this._callbacks.emit('on_stages_loaded')(d),
    () => this._callbacks.emit('on_stages_clear')()
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
    (d) => this._callbacks.emit('on_bgms_loaded')(d),
    () => this._callbacks.emit('on_bgms_clear')()
  );


  get_player_character(which: string) {
    for (const [id, player] of this.player_characters)
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
  readonly characters: Record<string, (num: number, team?: string) => void> = {}
  readonly weapons: Record<string, (num: number, team?: string) => void> = {}

  readonly dat_mgr: DatMgr;
  readonly sound_mgr: SoundMgr;
  readonly img_mgr: ImageMgr
  readonly keyboard: Keyboard;
  readonly pointings: Pointings;
  constructor(canvas: HTMLCanvasElement, overlay?: HTMLDivElement | null) {
    this.canvas = canvas;
    this.world = new World(this, canvas, overlay);
    this.dat_mgr = new DatMgr(this);
    this.sound_mgr = new SoundMgr(this);
    this.img_mgr = new ImageMgr(this);
    this.overlay = overlay;

    this.keyboard = new Keyboard();
    this.keyboard.callback.add(this);

    this.pointings = new Pointings(canvas);
    this.pointings.callback.add(this)

    this.disposer = () => this.keyboard.dispose()
    this.disposer = () => this.pointings.dispose()
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
  add_character(data: ICharacterData, num: number, team?: string): Character[];
  add_character(id: string, num: number, team?: string): Character[];
  add_character(data: ICharacterData | string | undefined, num: number, team?: string): Character[] {
    if (typeof data === 'string')
      data = this.dat_mgr.find_character(data)
    if (!data)
      return [];
    const ret: Character[] = []
    while (--num >= 0) {
      const e = new Character(this.world, data);
      e.team = team ?? new_team();
      this.random_entity_info(e).attach();
      ret.push(e)
    }
    return ret;
  }

  add_weapon(data: IWeaponData, num: number, team?: string): Weapon[];
  add_weapon(id: string, num: number, team?: string): Weapon[];
  add_weapon(data: IWeaponData | string | undefined, num: number, team?: string): Weapon[] {
    if (typeof data === 'string')
      data = this.dat_mgr.find_weapon(data)
    if (!data)
      return [];
    const ret: Weapon[] = []
    while (--num >= 0) {
      const e = new Weapon(this.world, data);
      if (is_str(team)) e.team = team;
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
      if (o.userData.owner instanceof Layer)
        o.userData.owner.show_indicators = false;
      else if (Entity.is(o.userData.owner))
        o.userData.owner.show_indicators = false;
    }
    this._intersection = next;
    (window as any).pick_0 = void 0
    if (!next) return;
    const o = next.object;
    (window as any).pick_0 = o.userData.owner ?? o.userData
    Log.print("click", o.userData.owner ?? o.userData)
    if (o.userData.owner instanceof Layer)
      o.userData.owner.show_indicators = true;
    else if (Entity.is(o.userData.owner)) {
      o.userData.owner.show_indicators = true;
      if (Character.is(o.userData.owner)) {
        this.on_click_character?.(o.userData.owner)
      }
    }
  }
  private mouse_on_layouts = new Set<Layout>()

  on_click(e: PointingEvent) {
    if (!this._layout) return;
    const coords = new THREE.Vector2(e.scene_x, e.scene_y);
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

  on_pointer_move(e: PointingEvent) {
    if (!this._layout) return;
    const coords = new THREE.Vector2(e.scene_x, e.scene_y);
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

  on_pointer_down(e: PointingEvent) {
    const coords = new THREE.Vector2(e.scene_x, e.scene_y)
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

  on_pointer_up(e: PointingEvent) {

  }

  private _curr_key_list: string = '';
  private readonly _cheats_map = new Map<string, Defines.ICheatInfo>([
    cheat_info_pair(Defines.Cheats.Hidden),
    cheat_info_pair(Defines.Cheats.Fn),
  ]);
  private readonly _cheats_enable_map = new Map<string, boolean>();
  private readonly _cheat_sound_id_map = new Map<string, string>();
  is_cheat_enabled(name: string | Defines.Cheats) {
    return !!this._cheats_enable_map.get('' + name)
  }
  on_key_down(e: KeyEvent) {
    const key = e.key?.toLowerCase() ?? ''
    this._curr_key_list += key;

    let match = false;
    for (const [cheat_name, { keys: k, sound: s }] of this._cheats_map) {
      if (k.startsWith(this._curr_key_list)) {
        match = true;
      }
      if (k !== this._curr_key_list) {
        continue;
      }
      const sound_id = this._cheat_sound_id_map.get(cheat_name);
      if (sound_id) this.sound_mgr.stop(sound_id);
      this.sound_mgr.play_with_load(s).then(v => this._cheat_sound_id_map.set(cheat_name, v));
      this._curr_key_list = ''
      const enabled = !this._cheats_enable_map.get(cheat_name)
      this._cheats_enable_map.set(cheat_name, enabled);
      this._callbacks.emit('on_cheat_changed')(cheat_name, enabled)
    }
    if (!match) this._curr_key_list = '';

    for (const k of KEY_NAME_LIST) {
      for (const [, player_info] of this._player_infos) {
        if (player_info.keys[k] === key) {
          this.layout?.on_player_key_down(k);
          return;
        }
      }
    }
  }

  on_key_up(e: KeyEvent) {

  }

  remove_all_entities() {
    this.world.del_game_objs(...this.world.entities);
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
  add_random_character(num = 1, team?: string): Character[] {
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

  add_player_character(player_id: string, character_id: string) {
    const player_info = this.player_infos.get(player_id);
    if (!player_info) { debugger; return; }

    const data = this.dat_mgr.characters.find(v => v.id === character_id)
    if (!data) { debugger; return; }
    let x = 0;
    let y = 0;
    let z = 0;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    let old_facing: TFace = 1;
    let old_frame_id: string = Defines.FrameId.Auto;
    const old = this.player_characters.get(player_id);
    if (old) {
      x = old.position.x;
      y = old.position.y;
      z = old.position.z;
      vx = old.velocity.x;
      vy = old.velocity.y;
      vz = old.velocity.z;
      old_facing = old.facing;
      old_frame_id = old.get_frame().id;
      this.world.del_game_objs(old);
    }

    const character = new Character(this.world, data)
    character.id = old?.id ?? new_id();
    character.position.x = x;
    character.position.y = y;
    character.position.z = z;
    character.velocity.x = vx;
    character.velocity.y = vy;
    character.velocity.z = vz;
    character.facing = old_facing;
    character.name = player_info.name;
    character.team = player_info.team;
    character.enter_frame(old_frame_id);
    if (!old) {
      this.random_entity_info(character)
    }
    character.controller = new LocalHuman(player_id, character, player_info?.keys)
    character.attach();
    return character
  }
  del_player_character(player_id: string) {
    const old = this.player_characters.get(player_id);
    if (old) this.world.del_game_objs(old)
  }
  change_bg(id: string) {
    const data = this.dat_mgr.find_background(id);
    if (!data) return;
    this.world.stage = new Stage(this.world, data)
  }
  remove_bg = () => this.remove_stage();

  change_stage(stage_info: IStageInfo): void
  change_stage(stage_id: string): void
  change_stage(arg_0: IStageInfo | string | undefined): void {
    if (arg_0 === this.world.stage.data)
      return;
    if (is_str(arg_0))
      arg_0 = this.stages.data?.find(v => v.id === arg_0)
    if (!arg_0)
      return;
    this.world.stage = new Stage(this.world, arg_0)
  }
  remove_stage() {
    this.world.stage = new Stage(this.world, Defines.THE_VOID_STAGE)
  }

  goto_next_stage() {
    const next = this.world.stage.data.next;
    const next_stage = this.stages.data?.find(v => v.id === next);
    if (!next_stage) {
      this.world.stage.stop_bgm();
      this.sound_mgr.play_with_load(Defines.Sounds.StagePass);
      this._callbacks.emit('on_stage_pass')();
      return;
    }
    this._callbacks.emit('on_enter_next_stage')();
    this.change_stage(next_stage)
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
    if (word === "paused")
      return this.world.paused ? 1 : 0
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
    this._callbacks.emit('on_layout_changed')(layout, prev_layout)
  }

  on_loading_content(content: string, progress: number) {
    this._callbacks.emit('on_loading_content')(content, progress);
  }
  on_loading_end() {
    this._loaded = true;
    this._loading = false;
    this._callbacks.emit('on_loading_end')();
  }
  on_loading_start() {
    this._loading = true;
    this._callbacks.emit('on_loading_start')();
  }
}