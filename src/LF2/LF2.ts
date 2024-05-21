import * as THREE from 'three';
import { Log, Warn } from '../Log';
import { ILf2Callback } from './ILf2Callback';
import { PlayerInfo } from './PlayerInfo';
import { World } from './World';
import Callbacks from './base/Callbacks';
import { Loader } from './base/Loader';
import NoEmitCallbacks from "./base/NoEmitCallbacks";
import { get_short_file_size_txt } from './base/get_short_file_size_txt';
import { new_id, new_team } from './base/new_id';
import Layer from './bg/Layer';
import { KEY_NAME_LIST } from './controller/BaseController';
import LocalHuman from "./controller/LocalHuman";
import { IBgData, ICharacterData, IWeaponData, TFace } from './defines';
import { IStageInfo } from "./defines/IStageInfo";
import { Defines } from './defines/defines';
import { IKeyboardCallback, KeyEvent, Keyboard } from './dom/Keyboard';
import Pointings, { IPointingsCallback, PointingEvent } from './dom/Pointings';
import Zip from './dom/download_zip';
import { import_as_blob_url, import_as_json } from './dom/make_import';
import './entity/Ball';
import Character from './entity/Character';
import './entity/Entity';
import Entity from './entity/Entity';
import './entity/Weapon';
import Weapon from './entity/Weapon';
import { is_character, is_entity } from './entity/type_check';
import Layout from './layout/Layout';
import DatMgr from './loader/DatMgr';
import get_import_fallbacks from "./loader/get_import_fallbacks";
import { ImageMgr } from './loader/loader';
import SoundMgr from './sound/SoundMgr';
import Stage from './stage/Stage';
import { constructor_name } from './utils/constructor_name';
import { fisrt } from './utils/container_help';
import { arithmetic_progression } from './utils/math/arithmetic_progression';
import { random_get, random_in, random_take } from './utils/math/random';
import { is_arr, is_num, is_str, not_empty_str } from './utils/type_check';

// Factory.inst.set('frame_animater', (...args) => new FrameAnimater(...args));
// Factory.inst.set('weapon', (...args) => new Weapon(...args))
// Factory.inst.set('character', (...args) => new Character(...args))
// Factory.inst.set('ball', (...args) => new Ball(...args))
const cheat_info_pair = (n: Defines.Cheats) => ['' + n, {
  keys: Defines.CheatKeys[n],
  sound: Defines.CheatSounds[n],
}] as const;

export default class LF2 implements IKeyboardCallback, IPointingsCallback {
  private _disposed: boolean = false;
  private _callbacks = new Callbacks<ILf2Callback>();
  private _layout_stacks: (Layout | undefined)[] = [];
  private _loading: boolean = false;
  private _loaded: boolean = false;
  private _difficulty: Defines.Difficulty = Defines.Difficulty.Difficult;
  get callbacks(): NoEmitCallbacks<ILf2Callback> { return this._callbacks }
  get loading() { return this._loading; }
  get loaded() { return this._loaded; }
  get need_load() { return !this._loaded && !this._loading; }

  get difficulty(): Defines.Difficulty { return this._difficulty; }
  set difficulty(v: Defines.Difficulty) {
    if (this._difficulty === v) return;
    const old = this._difficulty;
    this._difficulty = v;
    this._callbacks.emit('on_difficulty_changed')(v, old)
  }
  readonly canvas: HTMLCanvasElement;
  readonly world: World;
  private _zip: Zip | undefined;
  private _player_infos = new Map([
    ['1', new PlayerInfo('1')],
    ['2', new PlayerInfo('2')],
    ['3', new PlayerInfo('3')],
    ['4', new PlayerInfo('4')],
    ['5', new PlayerInfo('5')],
    ['6', new PlayerInfo('6')],
    ['7', new PlayerInfo('7')],
    ['8', new PlayerInfo('8')]
  ])
  get player_infos() { return this._player_infos }

  get player_characters() { return this.world.player_characters }

  get curr_layout(): Layout | undefined { return this._layout_stacks[this._layout_stacks.length - 1] }
  set curr_layout(v: Layout | undefined) { this._layout_stacks[this._layout_stacks.length - 1] = v }

  private _bgm_enable = false;
  get bgm_enable() { return this._bgm_enable; }
  set_bgm_enable(enabled: boolean): void {
    this._bgm_enable = enabled;
    this.world.stage.set_bgm_enable(enabled);
  }

  readonly stages = new Loader<IStageInfo[]>(
    async () => [Defines.VOID_STAGE, ...await this.import_json('data/stage.json')],
    (d) => this._callbacks.emit('on_stages_loaded')(d),
    () => this._callbacks.emit('on_stages_clear')()
  )

  readonly bgms = new Loader<string[]>(() => {
    const jobs = [
      "bgm/boss1.wma.ogg",
      "bgm/boss2.wma.ogg",
      "bgm/main.wma.ogg",
      "bgm/stage1.wma.ogg",
      "bgm/stage2.wma.ogg",
      "bgm/stage3.wma.ogg",
      "bgm/stage4.wma.ogg",
      "bgm/stage5.wma.ogg",
    ].map(async name => {
      await this.sounds.load(name, name);
      return name;
    })
    return Promise.all(jobs)
  },
    (d) => this._callbacks.emit('on_bgms_loaded')(d),
    () => this._callbacks.emit('on_bgms_clear')()
  );


  get_player_character(which: string) {
    for (const [id, player] of this.player_characters)
      if (id === which) return player;
  }
  on_click_character?: (c: Character) => void;

  async import_json(path: string): Promise<any> {
    const paths = get_import_fallbacks(path);
    const { _zip } = this;
    const obj = _zip && fisrt(paths, p => _zip.file(p))
    if (obj) return obj.json()
    return import_as_json(paths);
  }

  async import_resource(path: string): Promise<string> {
    const paths = get_import_fallbacks(path);
    const { _zip } = this;
    const obj = _zip && fisrt(paths, p => _zip.file(p))
    if (obj) return obj.blob().then(b => URL.createObjectURL(b))
    return import_as_blob_url(paths);
  }

  readonly characters: Record<string, (num: number, team?: string) => void> = {}
  readonly weapons: Record<string, (num: number, team?: string) => void> = {}

  readonly datas: DatMgr;
  readonly sounds: SoundMgr;
  readonly images: ImageMgr
  readonly keyboard: Keyboard;
  readonly pointings: Pointings;

  constructor(canvas: HTMLCanvasElement, overlay?: HTMLDivElement | null) {
    this.canvas = canvas;
    this.world = new World(this, canvas, overlay);
    this.datas = new DatMgr(this);
    this.sounds = new SoundMgr(this);
    this.images = new ImageMgr(this);
    this.keyboard = new Keyboard();
    this.keyboard.callback.add(this);

    this.pointings = new Pointings(canvas);
    this.pointings.callback.add(this);

    this.world.start_update();
    this.world.start_render();
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
      data = this.datas.find_character(data)
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
      data = this.datas.find_weapon(data)
    if (!data)
      return [];
    const ret: Weapon[] = []
    while (--num >= 0) {
      const e = new Weapon(this.world, data);
      if (not_empty_str(team)) e.team = team;
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
      else if (is_entity(o.userData.owner))
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
    else if (is_entity(o.userData.owner)) {
      o.userData.owner.show_indicators = true;
      if (is_character(o.userData.owner)) {
        this.on_click_character?.(o.userData.owner)
      }
    }
  }
  private mouse_on_layouts = new Set<Layout>()

  on_click(e: PointingEvent) {
    const { curr_layout: layout } = this;
    if (!layout) return;
    const coords = new THREE.Vector2(e.scene_x, e.scene_y);
    const { sprite } = layout;
    if (!sprite) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(coords, this.world.camera);
    const intersections = raycaster.intersectObjects([sprite.mesh], true);

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
        return b.z - a.z || b.index - a.index;
      })


    for (const layout of layouts)
      if (layout.on_click()) break;

  }

  on_pointer_move(e: PointingEvent) {
    const { curr_layout: layout } = this;
    if (!layout) return;
    const coords = new THREE.Vector2(e.scene_x, e.scene_y);
    const { sprite } = layout;
    if (!sprite) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(coords, this.world.camera);
    const intersections = raycaster.intersectObjects([sprite.mesh], true);
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
    cheat_info_pair(Defines.Cheats.LF2_NET),
    cheat_info_pair(Defines.Cheats.HERO_FT),
    cheat_info_pair(Defines.Cheats.GIM_INK),
  ]);
  private readonly _cheats_enable_map = new Map<string, boolean>();
  private readonly _cheat_sound_id_map = new Map<string, string>();
  is_cheat_enabled(name: string | Defines.Cheats) {
    return !!this._cheats_enable_map.get('' + name)
  }
  toggle_cheat_enabled(cheat_name: string | Defines.Cheats) {
    const cheat_info = this._cheats_map.get(cheat_name);
    if (!cheat_info) return;
    const { sound: s } = cheat_info;
    const sound_id = this._cheat_sound_id_map.get(cheat_name);
    if (sound_id) this.sounds.stop(sound_id);
    this.sounds.play_with_load(s).then(v => this._cheat_sound_id_map.set(cheat_name, v));
    const enabled = !this._cheats_enable_map.get(cheat_name);
    this._cheats_enable_map.set(cheat_name, enabled);
    this._callbacks.emit('on_cheat_changed')(cheat_name, enabled);
    this._curr_key_list = ''
  }
  on_key_down(e: KeyEvent) {
    const key_code = e.key?.toLowerCase() ?? ''
    this._curr_key_list += key_code;
    let match = false;
    for (const [cheat_name, { keys: k, sound: s }] of this._cheats_map) {
      if (k.startsWith(this._curr_key_list))
        match = true;
      if (k !== this._curr_key_list)
        continue;
      this.toggle_cheat_enabled(cheat_name)
    }
    if (!match) this._curr_key_list = '';

    if (e.times === 0) {
      const { curr_layout: layout } = this;
      if (layout) {
        for (const key_name of KEY_NAME_LIST) {
          for (const [player_id, player_info] of this._player_infos) {
            if (player_info.keys[key_name] === key_code)
              layout.on_player_key_down(player_id, key_name);
          }
        }
      }
    }
  }

  on_key_up(e: KeyEvent) {
    const key_code = e.key?.toLowerCase() ?? ''
    const { curr_layout: layout } = this;
    if (layout) {
      for (const key_name of KEY_NAME_LIST) {
        for (const [player_id, player_info] of this._player_infos) {
          if (player_info.keys[key_name] === key_code)
            layout.on_player_key_up(player_id, key_name);
        }
      }
    }
  }

  remove_all_entities() {
    this.world.del_game_objs(...this.world.entities);
    this.world.del_game_objs(...this.world.game_objs);
  }
  add_random_weapon(num = 1): Weapon[] {
    const ret: Weapon[] = []
    while (--num >= 0) {
      const d = random_get(this.datas.weapons);
      if (!d) continue;
      ret.push(...this.add_weapon(d, 1))
    }
    return ret;
  }
  add_random_character(num = 1, team?: string): Character[] {
    const ret: Character[] = []
    while (--num >= 0) {
      const d = random_get(this.datas.characters);
      if (!d) continue;
      ret.push(...this.add_character(d, 1, team))
    }
    return ret;
  }

  load(arg1?: Zip | string): Promise<void> {
    this._loading = true;
    this._callbacks.emit('on_loading_start')();
    this.set_layout("loading");
    if (is_str(arg1)) {
      return Zip.download(arg1, (progress, full_size) => {
        const txt = `download: ${arg1}(${get_short_file_size_txt(full_size)})`;
        this.on_loading_content(txt, progress);
      }).then(r => {
        return this.load_data(r)
      }).then(() => {
        this._loaded = true;
        this._callbacks.emit('on_loading_end')();
      }).catch((e) => {
        this._callbacks.emit('on_loading_failed')(e);
        return Promise.reject(e);
      }).finally(() => {
        this._loading = false;
      })
    } else {
      return this.load_data(arg1).then(() => {
        this._loaded = true;
        this._callbacks.emit('on_loading_end')();
        this._loading = false;
      }).catch((e) => {
        this._callbacks.emit('on_loading_failed')(e);
        return Promise.reject(e);
      }).finally(() => {
        this._loading = false;
      })
    }
  }

  private async load_data(zip?: Zip) {
    this._zip = zip;
    await this.datas.load();
    if (this._disposed)
      this.datas.dispose();

    for (const d of this.datas.characters) {
      const name = d.base.name.toLowerCase();
      this.characters[`add_${name}`] = (num = 1, team = void 0) => this.add_character(d, num, team);
    }
    for (const d of this.datas.weapons) {
      const name = d.base.name.toLowerCase();
      this.weapons[`add_${name}`] = (num = 1, team_1 = void 0) => this.add_weapon(d, num, team_1);
    }
  }

  dispose() {
    this._disposed = true;
    this._callbacks.emit('on_dispose')();
    this.world.dispose();
    this.datas.dispose();
    this.sounds.dispose();
    this.images.dispose();
    this.keyboard.dispose();
    this.pointings.dispose();
    if (this._layouts) {
      for (const l of this._layouts)
        l.dispose()
    }
  }

  add_player_character(player_id: string, character_id: string) {
    const player_info = this.player_infos.get(player_id);
    if (!player_info) { debugger; return; }

    const data = this.datas.characters.find(v => v.id === character_id)
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
  change_bg(bg_info: IBgData): void
  change_bg(bg_id: string): void
  change_bg(arg: IBgData | string | undefined) {
    if (!arg) return;
    if (is_str(arg))
      arg = this.datas.find_background(arg);
    if (!arg) return;
    this.world.stage = new Stage(this.world, arg)
  }
  remove_bg = () => this.remove_stage();

  change_stage(stage_info: IStageInfo): void
  change_stage(stage_id: string): void
  change_stage(arg: IStageInfo | string | undefined): void {
    if (arg === this.world.stage.data)
      return;
    if (is_str(arg))
      arg = this.stages.data?.find(v => v.id === arg)
    if (!arg)
      return;
    this.world.stage = new Stage(this.world, arg)
  }
  remove_stage() {
    this.world.stage = new Stage(this.world, Defines.VOID_STAGE)
  }

  goto_next_stage() {
    const next = this.world.stage.data.next;
    const next_stage = this.stages.data?.find(v => v.id === next);
    if (!next_stage) {
      this.world.stage.stop_bgm();
      this.sounds.play_with_load(Defines.Sounds.StagePass);
      this._callbacks.emit('on_stage_pass')();
      return;
    }
    this._callbacks.emit('on_enter_next_stage')();
    this.change_stage(next_stage)
  }

  private _launch_layout?: Layout;
  async launch_layout(): Promise<Layout> {
    if (this._launch_layout) return this._launch_layout;
    const path = "launch/init.json"
    const layout_info = await this.import_json(path);
    const layout = await Layout.cook(this, layout_info, this.layout_val_getter);
    return this._launch_layout = layout;
  }

  private _layouts: Layout[] = [];
  get layouts(): Layout[] { return this._layouts }

  async load_layouts(): Promise<Layout[]> {
    if (this._layouts.length) return this._layouts;

    const array = await this.import_json('layouts/index.json');
    if (!is_arr(array)) return this._layouts;

    const paths: string[] = ["launch/init.json"];
    for (const element of array) {
      if (is_str(element)) paths.push(element);
      else Warn.print('layouts/index.json', 'element is not a string! got:', element)
    }
    for (const path of paths) {
      const raw_layout = await this.import_json(path);
      const cooked_layout = await Layout.cook(this, raw_layout, this.layout_val_getter)
      this._layouts.push(cooked_layout);
      if (path === paths[0]) this.set_layout(cooked_layout)
    }

    if (this._disposed) {
      for (const l of this._layouts) l.dispose();
      this._layouts.length = 0;
    } else {
      this._callbacks.emit('on_layouts_loaded')()
    }
    return this._layouts;
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
          return item.state.img_idx = Math.floor(random_in(begin, end) % (end + 1))
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
  set_layout(arg: string | Layout | undefined): void {
    const prev = this._layout_stacks.pop();
    const curr = is_str(arg) ? this._layouts?.find(v => v.id === arg) : arg;
    prev?.on_unmount();
    this._layout_stacks.push(curr);
    curr?.on_mount();
    this._callbacks.emit('on_layout_changed')(curr, prev)
  }

  pop_layout(): void {
    const popped_layout = this._layout_stacks.pop()
    popped_layout?.on_unmount();
    this.curr_layout?.on_mount();
    this._callbacks.emit('on_layout_changed')(this.curr_layout, popped_layout)
  }

  push_layout(layout?: Layout): void;
  push_layout(id?: string): void;
  push_layout(arg: string | Layout | undefined): void {
    const prev = this.curr_layout
    const curr = is_str(arg) ? this._layouts?.find(v => v.id === arg) : arg;
    prev?.on_unmount();
    this._layout_stacks.push(curr);
    curr?.on_mount();
    this._callbacks.emit('on_layout_changed')(curr, prev)
  }

  on_loading_content(content: string, progress: number) {
    this._callbacks.emit('on_loading_content')(content, progress);
  }
  broadcast(message: string): void {
    this._callbacks.emit('on_broadcast')(message);
  }
  n_tree(n: THREE.Object3D = this.world.scene): II {
    const children = n.children.map(v => this.n_tree(v))
    return {
      name: `<${constructor_name(n)}>${n.name}`,
      inst: n,
      user_data: n.userData,
      children: children.length ? children : void 0
    }
  }
  switch_difficulty(): void {
    const { difficulty } = this;
    const max = this.is_cheat_enabled(Defines.Cheats.LF2_NET) ? 4 : 3;
    const next = (difficulty % max) + 1;
    this.difficulty = next
  }
}

interface II {
  name: string;
  inst: THREE.Object3D;
  user_data?: any,
  children?: II[];
}