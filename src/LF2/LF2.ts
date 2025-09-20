import { IIntersection } from "./3d";
import {
  Callbacks, get_short_file_size_txt,
  new_id,
  new_team,
  PIO
} from "./base";
import { KEY_NAME_LIST, LocalController } from "./controller";
import {
  BackgroundGroup,
  Builtin_FrameId, CheatType, Defines, Difficulty, IBgData,
  IStageInfo, TFace
} from "./defines";
import {
  Ditto,
  IKeyboard,
  IKeyboardCallback,
  IKeyEvent,
  IPointingEvent,
  IPointings,
  IPointingsCallback,
  ISounds,
  IZip,
  IZipObject,
} from "./ditto";
import { BlobUrl, HitUrl } from "./ditto/importer";
import { Entity } from "./entity";
import { IDebugging, make_debugging } from "./entity/make_debugging";
import { BallsHelper, CharactersHelper, EntitiesHelper, WeaponsHelper } from "./helper";
import { Randoming } from "./helper/Randoming";
import { ILf2Callback } from "./ILf2Callback";
import DatMgr from "./loader/DatMgr";
import get_import_fallbacks from "./loader/get_import_fallbacks";
import { ImageMgr } from "./loader/ImageMgr";
import { PlayerInfo } from "./PlayerInfo";
import { Stage } from "./stage";
import { UIComponent } from "./ui/component/UIComponent";
import { cook_ui_info } from "./ui/cook_ui_info";
import { ICookedUIInfo } from "./ui/ICookedUIInfo";
import { IUIInfo } from "./ui/IUIInfo.dat";
import { LF2PointerEvent } from "./ui/LF2PointerEvent";
import { LF2UIKeyEvent } from "./ui/LF2UIKeyEvent";
import { UINode } from "./ui/UINode";
import {
  fisrt,
  is_str
} from "./utils";
import { MersenneTwister } from "./utils/math/MersenneTwister";
import { World } from "./World";

const cheat_info_pair = (n: CheatType) =>
  [
    "" + n,
    {
      keys: Defines.CheatKeys[n],
      sound: Defines.CheatTypeSounds[n],
    },
  ] as const;

export class LF2 implements IKeyboardCallback, IPointingsCallback, IDebugging {
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;
  static readonly TAG = "LF2";
  static readonly instances: LF2[] = []
  lang: string = '';
  static readonly DATA_VERSION: number = 9;
  static readonly DATA_TYPE: string = 'DataZip';
  static get instance() { return LF2.instances[0] }
  static get ui() { return LF2.instances[0].ui }
  static get ditto() { return Ditto }
  private _disposed: boolean = false;
  readonly callbacks = new Callbacks<ILf2Callback>();
  private _ui_stacks: UINode[] = [];
  private _loading: boolean = false;
  private _playable: boolean = false;
  private _difficulty: Difficulty = Difficulty.Difficult;
  private _infinity_mp: boolean = false;
  private _pointer_on_uis = new Set<UINode>();
  private _pointer_raycaster = new Ditto.Raycaster();
  private _pointer_vec_2 = new Ditto.Vector2();
  private _mt = new MersenneTwister(Date.now())
  readonly bat_spreading_x = new Randoming(Defines.BAT_CHASE_SPREADING_VX, this)
  readonly bat_spreading_z = new Randoming(Defines.BAT_CHASE_SPREADING_VZ, this)
  readonly disater_spreading_x = new Randoming(Defines.DISATER_SPREADING_VX, this)
  readonly disater_spreading_y = new Randoming(Defines.DISATER_SPREADING_VY, this)
  readonly jan_devil_judgement_spreading_x = new Randoming(Defines.DEVIL_JUDGEMENT_SPREADING_VX, this)
  readonly jan_devil_judgement_spreading_y = new Randoming(Defines.DEVIL_JUDGEMENT_SPREADING_VY, this)

  get loading() {
    return this._loading;
  }
  get playable() {
    return this._playable;
  }
  get need_load() {
    return !this._playable && !this._loading;
  }

  get ui_stacks(): UINode[] {
    return this._ui_stacks;
  }
  get ui(): UINode | undefined {
    return this._ui_stacks[this._ui_stacks.length - 1];
  }
  get difficulty(): Difficulty {
    return this._difficulty;
  }
  set difficulty(v: Difficulty) {
    if (this._difficulty === v) return;
    const old = this._difficulty;
    this._difficulty = v;
    this.callbacks.emit("on_difficulty_changed")(v, old);
  }
  get infinity_mp(): boolean {
    return this._infinity_mp;
  }
  set infinity_mp(v: boolean) {
    if (this._infinity_mp === v) return;
    this._infinity_mp = v;
    this.callbacks.emit("on_infinity_mp")(v);
    if (!v) return;
    for (const e of this.world.entities) e.mp = e.mp_max;
  }

  readonly world: World;

  /**
   * 资源包列表
   * 
   * 
   * @readonly
   * @type {IZip[]}
   * @memberof LF2
   */
  readonly zips: IZip[] = [];
  readonly players: ReadonlyMap<string, PlayerInfo> = new Map([
    ["1", new PlayerInfo("1")],
    ["2", new PlayerInfo("2")],
    ["3", new PlayerInfo("3")],
    ["4", new PlayerInfo("4")],
    ["5", new PlayerInfo("5")],
    ["6", new PlayerInfo("6")],
    ["7", new PlayerInfo("7")],
    ["8", new PlayerInfo("8")],
  ]);

  get player_characters() {
    return this.world.slot_fighters;
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

  readonly bgms: string[] = []

  get_player_character(which: string) {
    for (const [id, player] of this.player_characters)
      if (id === which) return player;
  }
  on_click_character?: (c: Entity) => void;

  protected find_in_zip(paths: string[]): IZipObject | undefined {
    const len = paths.length;
    for (let i = 0; i < len; i++) {
      const idx = i
      const path = paths[idx];
      const obj = fisrt(this.zips, (z) => z.file(path));
      if (!obj) continue;
      return obj;
    }
  }

  /**
   * TODO
   *
   * @template C 
   * @param {string} path
   * @param {boolean} exact 准确匹配
   * @return {Promise<C>}
   * @memberof LF2
   */
  @PIO
  async import_json<C = any>(path: string, exact: boolean = true): Promise<[C, HitUrl]> {
    const paths = exact ? [path] : get_import_fallbacks(path)[0];
    const zip_obj = this.find_in_zip(paths)
    if (zip_obj) return [await zip_obj.json<C>(), zip_obj.name];
    const ret = await Ditto.Importer.import_as_json<C>(paths);
    return ret;
  }

  /**
   * 加载资源
   *
   * @param {string} path 资源路径
   * @param {boolean} exact 准确匹配
   * @return {Promise<[BlobUrl, HitUrl]>}
   * @memberof LF2
   */
  @PIO async import_resource(path: string, exact: boolean): Promise<[BlobUrl, HitUrl]> {
    const paths = exact ? [path] : get_import_fallbacks(path)[0];
    const zip_obj = this.find_in_zip(paths)
    if (zip_obj) return [await zip_obj.blob_url(), zip_obj.name];
    return Ditto.Importer.import_as_blob_url(paths);
  }

  @PIO async import_array_buffer(path: string, exact: boolean): Promise<[ArrayBuffer, HitUrl]> {
    const paths = exact ? [path] : get_import_fallbacks(path)[0];
    const zip_obj = this.find_in_zip(paths)
    if (zip_obj) return [await zip_obj.array_buffer(), zip_obj.name];
    return Ditto.Importer.import_as_array_buffer(paths);
  }

  constructor() {
    make_debugging(this)
    this.world = new World(this);
    this.datas = new DatMgr(this);
    this.sounds = new Ditto.Sounds(this);
    this.images = new ImageMgr(this);
    this.keyboard = new Ditto.Keyboard(this);
    this.keyboard.callback.add(this);
    this.pointings = new Ditto.Pointings();
    this.pointings.callback.add(this);
    this.world.start_update();
    this.world.start_render();
    LF2.instances.push(this)
    this.debug(`constructor`)
    Ditto.Cache.forget(LF2.DATA_TYPE, LF2.DATA_VERSION).catch(e => { })
    Ditto.Cache.forget(PlayerInfo.DATA_TYPE, PlayerInfo.DATA_VERSION).catch(e => { })
  }

  random_entity_info(e: Entity) {
    const { left: l, right: r, near: n, far: f } = this.world;
    e.id = new_id();
    e.facing = this.random_in(0, 100) % 2 ? -1 : 1;
    e.position.x = this.random_in(l, r);
    e.position.z = this.random_in(f, n);
    e.position.y = 550;
    return e;
  }


  protected get_pointer_intersections(e: IPointingEvent): IIntersection<UINode>[] {
    if (!this.ui) return [];
    this._pointer_vec_2.x = e.scene_x;
    this._pointer_vec_2.y = e.scene_y;
    this.world.renderer.camera.raycaster(this._pointer_raycaster, this._pointer_vec_2);
    const intersections = this.ui.renderer.sprite.intersect_from_raycaster(this._pointer_raycaster, true);
    const ret: IIntersection<UINode>[] = []
    for (const intersection of intersections) {
      const ui = intersection.object.get_user_data('owner');
      if (!(ui instanceof UINode)) continue;
      if (!ui.visible || ui.disabled) continue;
      intersection.extra = ui;
      ret.push(intersection);
    }
    return ret;
  }


  on_pointer_move(e: IPointingEvent) {
    const intersections = this.get_pointer_intersections(e);
    const leave_ui = this._pointer_on_uis;
    const stay_ui = new Set<UINode>();
    const enter_ui = new Set<UINode>();
    for (const { extra: ui } of intersections) {
      if (leave_ui.has(ui)) {
        leave_ui.delete(ui)
        stay_ui.add(ui)
      } else {
        enter_ui.add(ui);
      }
    }
    for (const ui of leave_ui) {
      ui.on_pointer_leave();
    }
    this._pointer_on_uis.clear();
    for (const ui of enter_ui) {
      ui.on_pointer_enter();
      this._pointer_on_uis.add(ui)
    }
    for (const ui of stay_ui) {
      this._pointer_on_uis.add(ui)
    }
  }
  _pointer_down_uis = new Set<UINode>();

  on_pointer_down(e: IPointingEvent) {
    const intersections = this.get_pointer_intersections(e);
    for (const i of intersections) {
      this._pointer_down_uis.add(i.extra)
      const e = new LF2PointerEvent(i.point);
      i.extra.on_pointer_down(e);
      if (e.stopped) break;
    }
  }

  on_pointer_up(e: IPointingEvent) {
    const intersections = this.get_pointer_intersections(e);
    for (const i of intersections) {
      if (i.extra.pointer_down) {
        this._pointer_down_uis.delete(i.extra)
        const e = new LF2PointerEvent(i.point);
        i.extra.on_pointer_up(e);
        if (e.stopped) break;
      }
    }
    for (const i of intersections) {
      if (i.extra.click_flag) {
        const e = new LF2PointerEvent(i.point);
        i.extra.on_click(e);
        if (e.stopped) break;
      }
    }

    for (const i of this._pointer_down_uis) {
      const e = new LF2PointerEvent(new Ditto.Vector3(NaN, NaN, NaN));
      i.on_pointer_cancel(e);
    }
    this._pointer_down_uis.clear()
  }

  on_pointer_cancel(e: IPointingEvent) {
    for (const i of this._pointer_down_uis) {
      const e = new LF2PointerEvent(new Ditto.Vector3(NaN, NaN, NaN));
      i.on_pointer_cancel(e);
    }
    this._pointer_down_uis.clear()
  }

  private _curr_key_list: string = "";
  private readonly _CheatType_map = new Map<string, Defines.ICheatInfo>([
    cheat_info_pair(CheatType.LF2_NET),
    cheat_info_pair(CheatType.HERO_FT),
    cheat_info_pair(CheatType.GIM_INK),
  ]);
  private readonly _CheatType_enable_map = new Map<string, boolean>();
  private readonly _cheat_sound_id_map = new Map<string, string>();
  is_cheat_enabled(name: string | CheatType) {
    return !!this._CheatType_enable_map.get("" + name);
  }
  toggle_cheat_enabled(cheat_name: string | CheatType) {
    const cheat_info = this._CheatType_map.get(cheat_name);
    if (!cheat_info) return;
    const { sound: s } = cheat_info;
    const sound_id = this._cheat_sound_id_map.get(cheat_name);
    if (sound_id) this.sounds.stop(sound_id);
    this.sounds
      .play_with_load(s)
      .then((v) => this._cheat_sound_id_map.set(cheat_name, v));
    const enabled = !this._CheatType_enable_map.get(cheat_name);
    this._CheatType_enable_map.set(cheat_name, enabled);
    this.callbacks.emit("on_cheat_changed")(cheat_name, enabled);
    this._curr_key_list = "";
  }
  cmds: string[] = [];
  on_key_down(e: IKeyEvent) {
    this.debug('on_key_down', e)
    const key_code = e.key;
    const ctrl_down = this.keyboard.is_key_down('control')
    if (ctrl_down) {

    } else {
      switch (e.key) {
        case 'f1': case 'f2': case 'f3': case 'f4': case 'f5':
        case 'f6': case 'f7': case 'f8': case 'f9': case 'f10':
          e.interrupt()
          this.cmds.push(e.key)
          break;
      }
    }

    this._curr_key_list += key_code;
    let match = false;
    for (const [cheat_name, { keys: k }] of this._CheatType_map) {
      if (k.startsWith(this._curr_key_list)) match = true;
      if (k !== this._curr_key_list) continue;
      this.toggle_cheat_enabled(cheat_name);
    }
    if (!match) this._curr_key_list = "";
    if (e.times === 0) {
      const { ui } = this;
      if (ui) {
        for (const key_name of KEY_NAME_LIST) {
          for (const [player_id, player_info] of this.players) {
            if (player_info.keys[key_name] === key_code) {
              const e = new LF2UIKeyEvent(player_id, key_name, key_code)
              ui.on_key_down(e);
            }
          }
        }
      }
    }
  }

  on_key_up(e: IKeyEvent) {
    const key_code = e.key?.toLowerCase() ?? "";
    const { ui } = this;
    if (ui) {
      for (const key_name of KEY_NAME_LIST) {
        for (const [player_id, player_info] of this.players) {
          if (player_info.keys[key_name] === key_code) {
            const e = new LF2UIKeyEvent(player_id, key_name)
            ui.on_key_up(e);
          }
        }
      }
    }
  }
  private on_loading_file(url: string, progress: number, full_size: number) {
    const txt = `${url}(${get_short_file_size_txt(full_size)})`;
    this.on_loading_content(txt, progress);
  }

  protected async load_zip_from_info_url(info_url: string): Promise<IZip> {
    this._dispose_check('load_zip_from_info_url')
    this.on_loading_content(`${info_url}`, 0);
    const [{ url, md5 }] = await Ditto.Importer.import_as_json([info_url]);
    this._dispose_check('load_zip_from_info_url')
    const exists = await Ditto.Cache.get(md5);
    this._dispose_check('load_zip_from_info_url')
    let ret: IZip | null = null;
    if (exists) {
      ret = await Ditto.Zip.read_buf(exists.name, exists.data);
      this._dispose_check('load_zip_from_info_url')
    } else {
      ret = await Ditto.Zip.download(url, (progress, full_size) =>
        this.on_loading_file(url, progress, full_size),
      );
      this._dispose_check('load_zip_from_info_url')
      await Ditto.Cache.del(info_url, "");
      this._dispose_check('load_zip_from_info_url')
      await Ditto.Cache.put({
        name: md5,
        version: LF2.DATA_VERSION,
        type: LF2.DATA_TYPE,
        data: ret.buf,
      });
    }
    this.on_loading_content(`${url}`, 100);
    return ret;
  }

  async load(arg1: IZip | string): Promise<void> {
    const is_first = this.zips.length === 0;
    this._dispose_check('load')
    this._loading = true;
    this.callbacks.emit("on_loading_start")();
    this.set_ui("loading");

    if (is_first)
      await this.import_json("launch/strings.json").then(r => this.load_strings(r[0])).catch(e => { })

    try {
      const zip = is_str(arg1) ? await this.load_zip_from_info_url(arg1) : arg1;
      await this.load_data(zip);
      await this.load_ui(zip);
      if (is_first) {
        this.set_ui(this.uiinfos[0]!)
        this.callbacks.emit("on_prel_loaded")();
      }
      this._playable = true;
      this.callbacks.emit("on_loading_end")();
    } catch (e) {
      this.callbacks.emit("on_loading_failed")(e);
      return await Promise.reject(e);
    } finally {
      this._loading = false;
    }
  }
  static IgnoreDisposed = (e: any) => {
    console.warn(e)
    if (e.is_disposed_error === true) return;
    throw e;
  }
  private _dispose_check = (fn: string) => {
    if (!this._disposed) return;
    const error = Object.assign(
      new Error(`[${LF2.TAG}::${fn}] instance disposed.`),
      { is_disposed_error: true }
    )
    throw error;
  }
  private async load_data(zip?: IZip) {
    this._dispose_check('load_data')
    if (zip) {
      await zip.file("strings.json")?.json().then(r => this.load_strings(r))
      this._dispose_check('load_data')
      await zip.file("strings.json5")?.json().then(r => this.load_strings(r))
      this._dispose_check('load_data')
      this.zips.unshift(zip);
      this.callbacks.emit("on_zips_changed")(this.zips);
    }
    await this.datas.load();
    this._dispose_check('load_data')
    for (const d of this.datas.characters) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.characters as any)[`add_${name}`] = (num = 1, team = void 0) =>
        this.characters.add(d, num, team);
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.characters.add(d, num, team_1);
    }
    for (const d of this.datas.weapons) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.weapons as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.weapons.add(d, num, team_1);
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.weapons.add(d, num, team_1);
    }
    for (const d of this.datas.balls) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.entities.add(d, num, team_1);
    }
    for (const d of this.datas.entity) {
      const name = d.base.name?.toLowerCase() ?? d.type + "_id_" + d.id;
      (this.entities as any)[`add_${name}`] = (num = 1, team_1 = void 0) =>
        this.entities.add(d, num, team_1);
    }
    if (zip) {
      const bgms = zip.file(/bgm\/.*?/)
      for (const bgm of bgms) {
        this.bgms.some(v => v === bgm.name) ||
          this.bgms.push(bgm.name)
      }
    }
  }
  dispose() {
    this.debug('dispose')
    this._disposed = true;
    this.callbacks.emit("on_dispose")();
    this.callbacks.clear()
    this.world.dispose();
    this.datas.dispose();
    this.sounds.dispose();
    this.images.dispose();
    this.keyboard.dispose();
    this.pointings.dispose();

    for (const l of this._ui_stacks) {
      l?.on_pause();
      l?.on_stop();
    }
    this._ui_stacks.length = 0;

    const i = LF2.instances.indexOf(this);
    if (i >= 0) LF2.instances.splice(i, 1);
  }

  add_player_character(player_id: string, character_id: string) {
    const player_info = this.players.get(player_id);
    if (!player_info) { debugger; return; }

    const data = this.datas.characters.find((v) => v.id === character_id);
    if (!data) { debugger; return; }
    let x = 0;
    let y = 0;
    let z = 0;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    let old_facing: TFace = 1;
    let old_frame_id: string = Builtin_FrameId.Auto;
    const old = this.player_characters.get(player_id);
    if (old) {
      x = old.position.x;
      y = old.position.y;
      z = old.position.z;
      vx = old.velocity_0.x;
      vy = old.velocity_0.y;
      vz = old.velocity_0.z;
      old_facing = old.facing;
      old_frame_id = old.frame.id;
      this.world.del_entity(old);
    }

    const character = new Entity(this.world, data);
    character.id = old?.id ?? new_id();
    character.position.x = x;
    character.position.y = y;
    character.position.z = z;
    character.velocity_0.x = vx;
    character.velocity_0.y = vy;
    character.velocity_0.z = vz;
    character.facing = old_facing;
    character.name = player_info.name;
    character.team = player_info.team ?? new_team();
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
    if (arg === Defines.RANDOM_BG || arg === Defines.RANDOM_BG.id || arg === '?')
      arg = this.random_get(this.datas.backgrounds.filter(v => v.base.group.some(a => a === BackgroundGroup.Regular)))
    if (is_str(arg)) arg = this.datas.find_background(arg);
    if (!arg) return;
    this.world.stage.change_bg(arg);
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
      this.callbacks.emit("on_stage_pass")();
    }
    this.change_stage(next_stage || Defines.VOID_STAGE);
    this.callbacks.emit("on_enter_next_stage")();
  }

  private _uiinfos_loaded = false;
  private _uiinfos: Readonly<ICookedUIInfo>[] = [];
  get uiinfos(): readonly ICookedUIInfo[] {
    return this._uiinfos;
  }
  get uiinfos_loaded() {
    return this._uiinfos_loaded;
  }

  protected _uiinfo_map = new Map<string, IUIInfo>();
  protected _strings = new Map<string, { [x in string]?: string }>()
  string(name: string): string {
    return (
      this._strings.get(this.lang)?.[name] ??
      this._strings.get("")?.[name] ?? name
    )
  }
  load_strings(strings: any) {
    const collection_pointers: [string, string][] = []
    for (const key in strings) {
      const collection = strings[key];
      if (typeof collection === 'string' && collection !== key)
        collection_pointers.push([key, collection]);
      else if (typeof collection === 'object') {
        for (const key in collection) {
          const v = collection[key]
          if (Array.isArray(v))
            collection[key] = v.join('\n')
        }
        const prev = this._strings.get(key)
        if (prev) this._strings.set(key, { ...collection, ...prev });
        else this._strings.set(key, collection)
      }
    }
    for (let i = 0; i < collection_pointers.length; i++) {
      const [a, b] = collection_pointers[i];
      const collection = this._strings.get(b)
      if (!collection) continue;
      this._strings.set(a, { ...collection });
      collection_pointers.splice(i, 1);
      --i
    }
  }

  protected async load_builtin_ui(): Promise<ICookedUIInfo[]> {

    this._dispose_check('load_builtin_ui')
    const ret: ICookedUIInfo[] = []
    const paths: string[] = [
      "launch/init.json",
      "launch/loading_anim.json",
      "launch/main_text_button.json",
      "launch/menu_text_button.json"
    ];
    for (const path of paths) {
      const cooked_ui_info = await cook_ui_info(this, path);
      this._dispose_check('load_builtin_ui')
      ret.push(cooked_ui_info);
    }
    return ret
  }

  async load_ui(zip: IZip): Promise<ICookedUIInfo[]> {
    this._dispose_check('load_ui')
    if (this._uiinfos.length) return this._uiinfos;

    this._uiinfos_loaded = false;
    const files = zip.file(/^layouts\/.*?\.json5?$/)
    const ret: ICookedUIInfo[] = []

    for (const file of files) {
      const json = await file.json().catch(() => null);
      this._dispose_check('load_ui')
      if (!json || Array.isArray(json)) continue;
      const cooked_ui_info = await cook_ui_info(this, json);
      ret.push(cooked_ui_info);
    }
    if (!this._uiinfos.length) {
      ret.unshift(...await this.load_builtin_ui())
      this._dispose_check('load_ui')
    }
    if (this._disposed) {
      this._uiinfos.length = 0;
      return this._uiinfos = [];
    } else {
      this._uiinfos_loaded = true;
      this._uiinfos.push(...ret)
      this.callbacks.emit("on_ui_loaded")(ret);
      return ret;
    }
  }

  ui_val_getter = (item: UINode, word: string) => {
    if (word === "mouse_on_me") return '' + item.pointer_on_me;
    if (word === "pointer_on_me") return '' + item.pointer_on_me;
    if (word === "paused") return this.world.paused ? 1 : 0;
    return word;
  };

  set_ui(ui_info?: ICookedUIInfo): void;
  set_ui(id?: string): void;
  set_ui(arg: string | ICookedUIInfo | undefined): void {
    if (is_str(arg) && this.ui?.id === arg) return;
    if (!is_str(arg) && this.ui?.id === arg?.id) return;

    const prev = this._ui_stacks.pop();
    prev?.on_pause();
    prev?.on_stop();
    const info = is_str(arg)
      ? this._uiinfos?.find((v) => v.id === arg)
      : arg;
    const curr = info && UINode.create(this, info);
    curr && this._ui_stacks.push(curr);
    curr?.on_start();
    curr?.on_resume();
    this.callbacks.emit("on_layout_changed")(curr, prev);
  }

  pop_ui(inclusive?: boolean, until?: (ui: UINode, index: number, stack: UINode[]) => boolean): void {
    const poppeds: UINode[] = []
    const len = this._ui_stacks.length
    for (let i = len - 1; i >= 0; --i) {
      const ui = this._ui_stacks[i]
      if (until) {
        if (until(ui, i, this._ui_stacks)) {
          if (inclusive) {
            poppeds.unshift(ui)
          }
          break;
        }
        poppeds.unshift(ui)
      } else {
        poppeds.unshift(ui);
        break;
      }
    }
    for (let i = 0; i < poppeds.length; i++) {
      const popped = poppeds[i];
      if (i === 0) popped?.on_pause();
      popped?.on_stop();
    }
    this._ui_stacks.splice(len - poppeds.length, poppeds.length)
    this.ui?.on_resume();
    this.callbacks.emit("on_layout_changed")(this.ui, poppeds[0]);
  }

  push_ui(layout_info?: ICookedUIInfo): void;
  push_ui(id?: string): void;
  push_ui(arg: string | ICookedUIInfo | undefined): void {
    const prev = this.ui;
    prev?.on_pause();

    const info = is_str(arg)
      ? this._uiinfos?.find((v) => v.id === arg)
      : arg;
    const curr = info && UINode.create(this, info);
    curr && this._ui_stacks.push(curr);
    curr?.on_start();
    curr?.on_resume();
    this.callbacks.emit("on_layout_changed")(curr, prev);
  }

  on_loading_content(content: string, progress: number) {
    this.callbacks.emit("on_loading_content")(content, progress);
  }

  broadcast(message: string): void {
    this.callbacks.emit("on_broadcast")(message);
  }
  on_component_broadcast(component: UIComponent, message: string) {
    this.callbacks.emit("on_component_broadcast")(component, message);
  }
  switch_difficulty(): void {
    const { difficulty } = this;
    const max = this.is_cheat_enabled(CheatType.LF2_NET) ? 4 : 3;
    const next = (difficulty % max) + 1;
    this.difficulty = next;
  }

  random_get<T>(a: T | T[] | undefined): T | undefined {
    if (!a || !Array.isArray(a)) return a
    return a[this.random_in(0, a.length)]
  }
  random_take<T>(a: T | T[] | undefined): T | undefined {
    if (!a || !Array.isArray(a)) return a
    return a.splice(this.random_in(0, a.length), 1)[0]
  }
  random_in(l: number, r: number) {
    return this._mt.in_range(l, r);
  }
}
(window as any).LF2 = LF2;