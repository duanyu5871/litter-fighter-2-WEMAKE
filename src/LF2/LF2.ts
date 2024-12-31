import * as THREE from "three";
import { Log, Warn } from "../Log";
import { ILf2Callback } from "./ILf2Callback";
import { PlayerInfo } from "./PlayerInfo";
import { World } from "./World";
import Callbacks from "./base/Callbacks";
import { Loader } from "./base/Loader";
import { NoEmitCallbacks } from "./base/NoEmitCallbacks";
import { get_short_file_size_txt } from "./base/get_short_file_size_txt";
import { new_id, new_team } from "./base/new_id";
import { KEY_NAME_LIST } from "./controller/BaseController";
import LocalController from "./controller/LocalController";
import { Defines, IBgData, IStageInfo, TFace } from "./defines";
import { IEntityData } from "./defines/IEntityData";
import ditto, {
  IKeyboard,
  IKeyboardCallback,
  IKeyEvent,
  IPointingEvent,
  IPointings,
  IPointingsCallback,
  ISounds,
  IZip,
} from "./ditto";

import { BallsHelper } from "./BallsHelper";
import { CharactersHelper } from "./CharactersHelper";
import { WeaponsHelper } from "./WeaponsHelper";
import Ditto from "./ditto";
import Entity from "./entity/Entity";
import { ILayoutInfo } from "./layout/ILayoutInfo";
import Layout, { ICookedLayoutInfo } from "./layout/Layout";
import DatMgr from "./loader/DatMgr";
import get_import_fallbacks from "./loader/get_import_fallbacks";
import { ImageMgr } from "./loader/loader";
import Stage from "./stage/Stage";
import { fisrt, last } from "./utils/container_help";
import { arithmetic_progression } from "./utils/math/arithmetic_progression";
import float_equal from "./utils/math/float_equal";
import { random_get, random_in, random_take } from "./utils/math/random";
import { is_arr, is_num, is_str, not_empty_str } from "./utils/type_check";
import { PIO } from "./utils/PromisesInOne";
import { EntitiesHelper } from "./EntitiesHelper";
import { Factory } from "./entity/Factory";

const cheat_info_pair = (n: Defines.Cheats) =>
  [
    "" + n,
    {
      keys: Defines.CheatKeys[n],
      sound: Defines.CheatSounds[n],
    },
  ] as const;

export default class LF2 implements IKeyboardCallback, IPointingsCallback {
  static readonly TAG = "LF2";
  private _disposed: boolean = false;
  private _callbacks = new Callbacks<ILf2Callback>();
  private _layout_stacks: Layout[] = [];
  private _loading: boolean = false;
  private _loaded: boolean = false;
  private _difficulty: Defines.Difficulty = Defines.Difficulty.Difficult;
  private _infinity_mp: boolean = false;
  get callbacks(): NoEmitCallbacks<ILf2Callback> {
    return this._callbacks;
  }
  get loading() {
    return this._loading;
  }
  get loaded() {
    return this._loaded;
  }
  get need_load() {
    return !this._loaded && !this._loading;
  }

  get layout_stacks() {
    return this._layout_stacks;
  }
  get layout() {
    return this._layout_stacks[this._layout_stacks.length - 1];
  }
  get difficulty(): Defines.Difficulty {
    return this._difficulty;
  }
  set difficulty(v: Defines.Difficulty) {
    if (this._difficulty === v) return;
    const old = this._difficulty;
    this._difficulty = v;
    this._callbacks.emit("on_difficulty_changed")(v, old);
  }
  get infinity_mp(): boolean {
    return this._infinity_mp;
  }
  set infinity_mp(v: boolean) {
    if (this._infinity_mp === v) return;
    this._infinity_mp = v;
    this._callbacks.emit("on_infinity_mp")(v);
    if (!v) return;
    for (const e of this.world.entities) e.mp = e.mp_max;
  }

  readonly world: World;

  private _zips: IZip[] = []; // [game data zip, preliminary data zip]

  get zips() { return this._zips }

  private _player_infos = new Map([
    ["1", new PlayerInfo("1")],
    ["2", new PlayerInfo("2")],
    ["3", new PlayerInfo("3")],
    ["4", new PlayerInfo("4")],
    ["5", new PlayerInfo("5")],
    ["6", new PlayerInfo("6")],
    ["7", new PlayerInfo("7")],
    ["8", new PlayerInfo("8")],
  ]);
  get player_infos() {
    return this._player_infos;
  }

  get player_characters() {
    return this.world.player_slot_characters;
  }

  readonly characters = new CharactersHelper(this);
  readonly weapons = new WeaponsHelper(this);
  readonly entities = new EntitiesHelper(this);
  readonly balls = new BallsHelper(this);
  readonly datas: DatMgr;
  readonly sounds: ISounds;
  readonly images: ImageMgr;
  readonly keyboard: IKeyboard;
  readonly pointings: IPointings;

  get stages(): IStageInfo[] {
    return this.datas.stages;
  }

  find_stage(stage_id: string): IStageInfo | undefined {
    return this.stages.find((v) => v.id === stage_id);
  }

  readonly bgms = new Loader<string[]>(
    () => {
      const jobs = ["launch/main.wma.mp3"].map(async (name) => {
        await this.sounds.load(name, name);
        return name;
      });
      return Promise.all(jobs);
    },
    (d) => this._callbacks.emit("on_bgms_loaded")(d),
    () => this._callbacks.emit("on_bgms_clear")(),
  );

  get_player_character(which: string) {
    for (const [id, player] of this.player_characters)
      if (id === which) return player;
  }
  on_click_character?: (c: Entity) => void;

  @PIO
  async import_json<C = any>(path: string): Promise<C> {
    const paths = get_import_fallbacks(path);
    for (const path of paths) {
      const zip_obj = fisrt(this._zips, (z) => z.file(path));
      if (!zip_obj) continue;
      return zip_obj.json() as C;
    }
    const v = await ditto.Importer.import_as_json<C>(paths);
    return v[0];
  }

  @PIO
  async import_resource(path: string): Promise<[string, string]> {
    const paths = get_import_fallbacks(path);
    for (const path of paths) {
      const zip_obj = fisrt(this._zips, (z) => z.file(path));
      if (!zip_obj) continue;
      return [await zip_obj.blob_url(), zip_obj.name];
    }
    return ditto.Importer.import_as_blob_url(paths);
  }

  constructor(canvas: HTMLCanvasElement) {
    this.world = new World(this, canvas);
    this.datas = new DatMgr(this);
    this.sounds = new ditto.Sounds(this);
    this.images = new ImageMgr(this);
    this.keyboard = new ditto.Keyboard();
    this.keyboard.callback.add(this);
    this.pointings = new ditto.Pointings(canvas);
    this.pointings.callback.add(this);
    this.world.start_update();
    this.world.start_render();
    this.load_prel_data_zip("prel.zip.json");
  }

  random_entity_info(e: Entity) {
    const { left: l, right: r, near: n, far: f } = this.world;
    const rand = () => Math.random();
    e.id = new_id();
    e.facing = Math.floor(rand() * 100) % 2 ? -1 : 1;
    e.position.x = l + rand() * (r - l);
    e.position.z = f + rand() * (n - f);
    e.position.y = 550;
    return e;
  }

  add_character(
    data: IEntityData | string | undefined,
    num: number,
    team?: string,
  ): Entity[] {
    if (typeof data === "string") data = this.datas.find_character(data);
    if (!data) return [];
    return this.add_entity(data, num, team);
  }

  add_weapon(
    data?: IEntityData | string,
    num: number = 1,
    team?: string,
  ): Entity[] {
    if (typeof data === "string") data = this.datas.find_weapon(data);
    if (!data) return [];
    return this.add_entity(data, num, team);
  }

  add_entity(data: IEntityData, num: number = 1, team?: string): Entity[] {
    const creator = Factory.inst.get_entity_creator(data.type);
    if (!creator) return [];
    const ret: Entity[] = [];
    while (--num >= 0) {
      const entity = creator(this.world, data);
      entity.team = not_empty_str(team) ? team : new_team();
      this.random_entity_info(entity).attach();
      ret.push(entity);
    }
    return ret;
  }

  private _mouse_on_layouts = new Set<Layout>();
  private _pointer_raycaster = new THREE.Raycaster();
  private _pointer_vec_2 = new Ditto.Vector2();

  on_pointer_move(e: IPointingEvent) {
    const { layout } = this;
    if (!layout) return;
    this._pointer_vec_2.x = e.scene_x;
    this._pointer_vec_2.y = e.scene_y;
    const { sprite } = layout;
    if (!sprite) return;
    this.world.camera.raycaster(this._pointer_raycaster, this._pointer_vec_2);
    const intersections = sprite.intersect_from_raycaster(
      this._pointer_raycaster,
      true,
    );
    this._mouse_on_layouts.clear();
    for (const {
      object: {
        userData: { owner },
      },
    } of intersections) {
      if (owner instanceof Layout) this._mouse_on_layouts.add(owner);
    }
    for (const layout of this._mouse_on_layouts) {
      if (!this._mouse_on_layouts.has(layout)) {
        layout.on_mouse_enter();
        layout.state.mouse_on_me = "1";
      }
    }
    for (const layout of this._mouse_on_layouts) {
      if (!this._mouse_on_layouts.has(layout)) {
        layout.on_mouse_leave();
        layout.state.mouse_on_me = "0";
      }
    }
  }

  on_pointer_down(e: IPointingEvent) {
    this._pointer_vec_2.x = e.scene_x;
    this._pointer_vec_2.y = e.scene_y;
    this.world.camera.raycaster(this._pointer_raycaster, this._pointer_vec_2);
    const intersections = this.world.scene.intersects_from_raycaster(
      this._pointer_raycaster,
    );
    // if (!intersections.length) {
    //   this.pick_intersection(void 0)
    // } else {
    //   if (this._intersection) {
    //     const idx = intersections.findIndex(v => v.object === this._intersection?.object);
    //     const iii = intersections.find((v, i) => i > idx && v.object.userData.owner);
    //     this.pick_intersection(iii)
    //   } else {
    //     const iii = intersections.find(v => v.object.userData.owner)
    //     this.pick_intersection(iii)
    //   }
    // }
    {
      const { layout } = this;
      if (!layout) return;
      const { sprite } = layout;
      if (!sprite) return;
      this.world.camera.raycaster(this._pointer_raycaster, this._pointer_vec_2);
      const intersections = sprite.intersects_from_raycaster(
        this._pointer_raycaster,
        true,
      );
      const layouts = intersections
        .filter((v) => v.object.userData.owner instanceof Layout)
        .map((v) => v.object.userData.owner as Layout)
        .filter((v) => v.global_visible && !v.global_disabled)
        .sort((a, b) => {
          const { global_z: z_a, depth: d_a } = a;
          const { global_z: z_b, depth: d_b } = b;
          if (!float_equal(z_a, d_a)) return z_b - z_a;
          return d_b - d_a;
        });
      for (const layout of layouts) if (layout.on_click()) break;
    }
  }

  on_pointer_up(e: IPointingEvent) { }

  private _curr_key_list: string = "";
  private readonly _cheats_map = new Map<string, Defines.ICheatInfo>([
    cheat_info_pair(Defines.Cheats.LF2_NET),
    cheat_info_pair(Defines.Cheats.HERO_FT),
    cheat_info_pair(Defines.Cheats.GIM_INK),
  ]);
  private readonly _cheats_enable_map = new Map<string, boolean>();
  private readonly _cheat_sound_id_map = new Map<string, string>();
  is_cheat_enabled(name: string | Defines.Cheats) {
    return !!this._cheats_enable_map.get("" + name);
  }
  toggle_cheat_enabled(cheat_name: string | Defines.Cheats) {
    const cheat_info = this._cheats_map.get(cheat_name);
    if (!cheat_info) return;
    const { sound: s } = cheat_info;
    const sound_id = this._cheat_sound_id_map.get(cheat_name);
    if (sound_id) this.sounds.stop(sound_id);
    this.sounds
      .play_with_load(s)
      .then((v) => this._cheat_sound_id_map.set(cheat_name, v));
    const enabled = !this._cheats_enable_map.get(cheat_name);
    this._cheats_enable_map.set(cheat_name, enabled);
    this._callbacks.emit("on_cheat_changed")(cheat_name, enabled);
    this._curr_key_list = "";
  }

  on_key_down(e: IKeyEvent) {
    const key_code = e.key?.toLowerCase() ?? "";
    this._curr_key_list += key_code;
    let match = false;
    for (const [cheat_name, { keys: k }] of this._cheats_map) {
      if (k.startsWith(this._curr_key_list)) match = true;
      if (k !== this._curr_key_list) continue;
      this.toggle_cheat_enabled(cheat_name);
    }
    if (!match) this._curr_key_list = "";
    if (e.times === 0) {
      const { layout } = this;
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

  on_key_up(e: IKeyEvent) {
    const key_code = e.key?.toLowerCase() ?? "";
    const { layout } = this;
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
    this.world.del_entities(Array.from(this.world.entities));
  }
  add_random_weapon(num = 1, duplicate = false): Entity[] {
    const src_arr = [...this.datas.weapons];
    let tmp_arr = [...src_arr];
    const ret: Entity[] = [];
    while (--num >= 0) {
      const d = duplicate ? random_get(tmp_arr) : random_take(tmp_arr);
      if (!tmp_arr.length) tmp_arr = [...src_arr];
      if (!d) continue;
      ret.push(...this.add_weapon(d, 1));
    }
    return ret;
  }
  add_random_character(num = 1, team?: string): Entity[] {
    const ret: Entity[] = [];
    while (--num >= 0) {
      const d = random_get(this.datas.characters);
      if (!d) continue;
      ret.push(...this.add_character(d, 1, team));
    }
    return ret;
  }

  private on_loading_file(url: string, progress: number, full_size: number) {
    const txt = `${url}(${get_short_file_size_txt(full_size)})`;
    this.on_loading_content(txt, progress);
  }

  async load_prel_data_zip(url: string): Promise<IZip> {
    const ret = await this.load_zip_from_info_url(url);
    this._zips.unshift(ret);
    await this.load_layouts();
    this._callbacks.emit("on_prel_data_loaded")();
    return ret;
  }

  async load_zip_from_info_url(info_url: string): Promise<IZip> {
    this.on_loading_content(`${info_url}`, 0);
    const [{ url, md5 }] = await ditto.Importer.import_as_json([info_url]);
    const exists = await ditto.Cache.get(md5);
    let ret: IZip | null = null;
    if (exists) {
      const nums = [];
      for (var i = 0, j = exists.data.length; i < j; ++i)
        nums.push(exists.data.charCodeAt(i));
      ret = await ditto.Zip.read_buf(new Uint8Array(nums));
    } else {
      ret = await ditto.Zip.download(url, (progress, full_size) =>
        this.on_loading_file(url, progress, full_size),
      );
      let data: string = "";
      for (const c of ret.buf) data += String.fromCharCode(c);
      await ditto.Cache.del(info_url, "");
      await ditto.Cache.put(md5, 0, info_url, data);
    }
    this.on_loading_content(`${url}`, 100);
    return ret;
  }
  async load(arg1?: IZip | string): Promise<void> {
    this._loading = true;
    this._callbacks.emit("on_loading_start")();
    this.set_layout("loading");

    try {
      const zip = is_str(arg1) ? await this.load_zip_from_info_url(arg1) : arg1;
      await this.load_data(zip);
      this._loaded = true;
      this._callbacks.emit("on_loading_end")();
    } catch (e) {
      this._callbacks.emit("on_loading_failed")(e);
      return await Promise.reject(e);
    } finally {
      this._loading = false;
    }
  }

  private async load_data(zip?: IZip) {
    if (zip) this._zips.unshift(zip);
    await this.datas.load();
    if (this._disposed) this.datas.dispose();
    for (const d of this.datas.characters) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.characters as any)[`add_${name}`] = (num = 1, team = void 0) =>
        this.add_character(d, num, team);
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.add_character(d, num, team_1);
    }
    for (const d of this.datas.weapons) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.weapons as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.add_weapon(d, num, team_1);
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.add_weapon(d, num, team_1);
    }
    for (const d of this.datas.balls) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.add_entity(d, num, team_1);
    }
    for (const d of this.datas.entity) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.add_entity(d, num, team_1);
    }
  }

  dispose() {
    this._disposed = true;
    this._callbacks.emit("on_dispose")();
    this.world.dispose();
    this.datas.dispose();
    this.sounds.dispose();
    this.images.dispose();
    this.keyboard.dispose();
    this.pointings.dispose();

    for (const l of this._layout_stacks) {
      l?.on_pause();
      l?.on_stop();
    }
    this._layout_stacks.length = 0;
  }

  add_player_character(player_id: string, character_id: string) {
    const player_info = this.player_infos.get(player_id);
    if (!player_info) {
      debugger;
      return;
    }

    const data = this.datas.characters.find((v) => v.id === character_id);
    if (!data) {
      debugger;
      return;
    }
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
      vx = old.velocities[0].x;
      vy = old.velocities[0].y;
      vz = old.velocities[0].z;
      old_facing = old.facing;
      old_frame_id = old.frame.id;
      this.world.del_entity(old);
    }

    const character = new Entity(this.world, data);
    character.id = old?.id ?? new_id();
    character.position.x = x;
    character.position.y = y;
    character.position.z = z;
    character.velocities[0].x = vx;
    character.velocities[0].y = vy;
    character.velocities[0].z = vz;
    character.facing = old_facing;
    character.name = player_info.name;
    character.team = player_info.team;
    character.enter_frame({ id: old_frame_id });
    if (!old) {
      this.random_entity_info(character);
    }
    character.ctrl = new LocalController(
      player_id,
      character,
      player_info?.keys,
    );
    character.attach();
    return character;
  }
  del_player_character(player_id: string) {
    const old = this.player_characters.get(player_id);
    if (old) this.world.del_entity(old);
  }
  change_bg(bg_info: IBgData): void;
  change_bg(bg_id: string): void;
  change_bg(arg: IBgData | string | undefined) {
    if (!arg) return;
    if (is_str(arg)) arg = this.datas.find_background(arg);
    if (!arg) return;
    this.world.stage = new Stage(this.world, arg);
  }
  remove_bg = () => this.remove_stage();

  change_stage(stage_info: IStageInfo): void;
  change_stage(stage_id: string): void;
  change_stage(arg: IStageInfo | string | undefined): void {
    if (arg === this.world.stage.data) return;
    if (is_str(arg)) arg = this.stages?.find((v) => v.id === arg);
    if (!arg) return;
    this.world.stage = new Stage(this.world, arg);
  }
  remove_stage() {
    this.world.stage = new Stage(this.world, Defines.VOID_STAGE);
  }

  goto_next_stage() {
    const next = this.world.stage.data.next;
    const next_stage = this.stages?.find((v) => v.id === next);
    if (!next_stage) {
      this.world.stage.stop_bgm();
      this.sounds.play_with_load(Defines.Sounds.StagePass);
      this._callbacks.emit("on_stage_pass")();
      return;
    }
    this._callbacks.emit("on_enter_next_stage")();
    this.change_stage(next_stage);
  }

  private _layout_infos_loaded = false;
  private _layout_infos: ICookedLayoutInfo[] = [];
  get layout_infos(): readonly ICookedLayoutInfo[] {
    return this._layout_infos;
  }
  get layout_infos_loaded() {
    return this._layout_infos_loaded;
  }

  protected _layout_info_map = new Map<string, ILayoutInfo>();

  async load_layouts(): Promise<ICookedLayoutInfo[]> {
    if (this._layout_infos.length) return this._layout_infos;
    const array = await this.import_json("layouts/index.json").catch((e) => []);
    this._layout_infos_loaded = false;
    const paths: string[] = ["launch/init.json"];
    for (const element of array) {
      if (is_str(element)) paths.push(element);
      else
        Warn.print(
          LF2.TAG + "::load_layouts",
          "layouts/index.json",
          "element is not a string! got:",
          element,
        );
    }
    for (const path of paths) {
      const cooked_layout_data = await Layout.cook_layout_info(this, path);
      this._layout_infos.push(cooked_layout_data);
      if (path === paths[0]) this.set_layout(cooked_layout_data);
    }
    if (this._disposed) {
      this._layout_infos.length = 0;
    } else {
      this._callbacks.emit("on_layouts_loaded")(this._layout_infos);
      this._layout_infos_loaded = true;
    }
    return this._layout_infos;
  }

  layout_val_getter = (item: Layout, word: string) => {
    if (word === "mouse_on_me") return item.state.mouse_on_me;
    if (word === "paused") return this.world.paused ? 1 : 0;
    if (word.startsWith("f:")) {
      let result = word.match(/f:random_int_in_range\((\d+),(\d+),?(\d+)?\)/);
      if (result) {
        const [, a, b, group_id] = result;
        const begin = Number(a);
        const end = Number(b);
        if (begin > end) return end;
        const { img_idx } = item.state;
        if (is_num(img_idx)) return img_idx;
        if (is_str(group_id) && item.parent) {
          let arr = item.parent.state["random_int_arr" + group_id];
          if (!is_arr(arr) || !arr.length)
            arr = item.parent.state["random_int_arr" + group_id] =
              arithmetic_progression(begin, end, 1);
          return (item.state.img_idx = random_take(arr));
        } else {
          return (item.state.img_idx = Math.floor(
            random_in(begin, end) % (end + 1),
          ));
        }
      }
    }
    return word;
  };

  set_layout(layout_info?: ICookedLayoutInfo): void;
  set_layout(id?: string): void;
  set_layout(arg: string | ICookedLayoutInfo | undefined): void {
    const prev = this._layout_stacks.pop();
    prev?.on_pause();

    const info = is_str(arg)
      ? this._layout_infos?.find((v) => v.id === arg)
      : arg;
    const curr = info && Layout.cook(this, info, this.layout_val_getter);
    curr && this._layout_stacks.push(curr);
    curr?.on_start();
    curr?.on_resume();
    this._callbacks.emit("on_layout_changed")(curr, prev);
  }

  pop_layout(): void {
    if (this._layout_stacks.length <= 1) {
      Warn.print(LF2.TAG + "::pop_layout", "can not pop top layout!");
      return;
    }
    const popped = this._layout_stacks.pop();
    popped?.on_pause();
    popped?.on_stop();
    this.layout?.on_resume();
    this._callbacks.emit("on_layout_changed")(this.layout, popped);
  }

  push_layout(layout_info?: ICookedLayoutInfo): void;
  push_layout(id?: string): void;
  push_layout(arg: string | ICookedLayoutInfo | undefined): void {
    const prev = this.layout;
    prev?.on_pause();

    const info = is_str(arg)
      ? this._layout_infos?.find((v) => v.id === arg)
      : arg;
    const curr = info && Layout.cook(this, info, this.layout_val_getter);
    curr && this._layout_stacks.push(curr);
    curr?.on_start();
    curr?.on_resume();
    this._callbacks.emit("on_layout_changed")(curr, prev);
  }

  on_loading_content(content: string, progress: number) {
    this._callbacks.emit("on_loading_content")(content, progress);
  }
  broadcast(message: string): void {
    this._callbacks.emit("on_broadcast")(message);
  }

  get_layout_tree(layout: Layout): ILayoutTreeNode;
  get_layout_tree(layout?: Layout | undefined): ILayoutTreeNode | null;
  get_layout_tree(
    layout: Layout | undefined = last(this._layout_stacks),
  ): ILayoutTreeNode | null {
    if (!layout) return null;
    const ret: ILayoutTreeNode = {
      name: layout.name
        ? `name: ${layout.name}`
        : layout.id
          ? `id: ${layout.id}`
          : "<no_name>",
      children: layout.children.map((v) => this.get_layout_tree(v)),
      inst: layout,
    };
    if (ret.children?.length === 0) delete ret.children;
    return ret;
  }

  switch_difficulty(): void {
    const { difficulty } = this;
    const max = this.is_cheat_enabled(Defines.Cheats.LF2_NET) ? 4 : 3;
    const next = (difficulty % max) + 1;
    this.difficulty = next;
  }

  list_writable_properties(
    prototype: any = this,
    ret: (PropertyDescriptor & { name: string })[] = [],
  ) {
    const obj = Object.getOwnPropertyDescriptors(prototype);
    for (const name in obj) {
      if (name.startsWith("_")) continue;
      const desc = obj[name];
      const { value, writable, enumerable, set, get } = desc;
      if (set && typeof get?.call(this) === "number")
        ret.push({ name, ...desc });
      else if (writable && enumerable && is_num(value))
        ret.push({ name, ...desc });
    }
    const next = Object.getPrototypeOf(prototype);
    if (next.constructor.name !== "Object") {
      this.list_writable_properties(next, ret);
    }
    return ret;
  }
}
interface ILayoutTreeNode {
  name: string;
  children?: ILayoutTreeNode[];
  inst: Layout;
}
