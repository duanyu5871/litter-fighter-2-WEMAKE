import { Callbacks, NoEmitCallbacks } from "./base";
import type { TKeys } from "./controller/BaseController";
import { Defines, GameKey } from "./defines";
import { IPurePlayerInfo } from "./defines/IPurePlayerInfo";
import Ditto from "./ditto";
import { IDebugging } from "./entity/make_debugging";
import { IPlayerInfoCallback } from "./IPlayerInfoCallback";
import { is_str } from "./utils/type_check";

export class PlayerInfo implements IDebugging {
  static readonly TAG = "PlayerInfo";

  protected _callbacks = new Callbacks<IPlayerInfoCallback>();
  protected _info: IPurePlayerInfo;
  protected _joined: boolean = false;
  protected _is_com: boolean = false;
  protected _team_decided: boolean = false;
  protected _character_decided: boolean = false;
  protected _random_character: string = "";

  get id(): string { return this._info.id; }
  get storage_key() { return "player_info_" + this.id; }
  get name(): string { return this._info.name; }
  get keys(): TKeys { return this._info.keys; }
  get team(): string { return this._info.team; }
  set team(v: string) { this._info.team = v }
  get character(): string { return this._info.character || this._random_character; }
  set character(v: string) { this._info.character = v }
  get random_character() { return this._random_character; }
  set random_character(v: string) { this._random_character = v }
  get is_random() { return !this._info.character; }
  get callbacks(): NoEmitCallbacks<IPlayerInfoCallback> { return this._callbacks; }
  get joined(): boolean { return this._joined; }
  set joined(v: boolean) { this._joined = v }
  get is_com(): boolean { return this._is_com; }
  set is_com(v: boolean) { this._is_com = v }
  get team_decided(): boolean { return this._team_decided; }
  set team_decided(v: boolean) { this._team_decided = v }
  get character_decided(): boolean { return this._character_decided; }
  set character_decided(v: boolean) { this._character_decided = v }

  constructor(
    id: string,
    name: string = id,
    keys: TKeys = Defines.get_default_keys(id),
  ) {
    this._info = { id, name, keys, team: "", version: 0, character: "" };
    this.load();
  }
  __debugging?: boolean | undefined;
  debug(func: string, ...args: any[]): void { }
  warn(func: string, ...args: any[]): void { }
  log(func: string, ...args: any[]): void { }

  save(): void {
    Ditto.Cache.put({
      name: this.storage_key,
      version: 0,
      data: JSON.stringify(this._info)
    })
  }

  load() {
    Ditto.Cache.get(this.storage_key).then((r) => {
      if (!r) return
      const { data: str } = r
      try {
        const { name, keys, version } = JSON.parse(str) as Partial<IPurePlayerInfo>;
        if (version !== this._info.version) {
          this.warn("load", "version changed");
          return false;
        }
        this._info.name = is_str(name) ? name : this._info.name;
        this._info.keys = keys ? keys : this._info.keys;
        return true;
      } catch (e) {
        this.warn("load", "load failed, ", e);
        return false;
      }
    });
  }

  set_name(name: string, emit: boolean): this {
    if (this._info.name === name) return this;
    const prev = this._info.name;
    this._info.name = name;
    if (emit) this._callbacks.emit("on_name_changed")(name, prev);
    return this;
  }

  set_character(character: string, emit: boolean): this {
    if (this._info.character === character) return this;
    const prev = this._info.character;
    this._info.character = character;
    if (emit) this._callbacks.emit("on_character_changed")(character, prev);
    return this;
  }

  /**
   * 设置随机中的角色ID
   *
   * @param {string} character 角色ID，空字符串视为未设置
   * @returns {this}
   */
  set_random_character(character: string, emit: boolean): this {
    if (this._random_character === character) return this;
    const prev = this._random_character;
    this._random_character = character;
    if (emit) this._callbacks.emit("on_random_character_changed")(character, prev);
    return this;
  }

  set_team(team: string, emit: boolean): this {
    if (this._info.team === team) return this;
    const prev = this._info.team;
    this._info.team = team;
    if (emit) this._callbacks.emit("on_team_changed")(team, prev);
    return this;
  }

  set_joined(joined: boolean, emit: boolean): this {
    if (this._joined === joined) return this;
    this._joined = joined;
    if (emit) this._callbacks.emit("on_joined_changed")(joined);
    return this;
  }

  set_is_com(is_com: boolean, emit: boolean): this {
    if (this._is_com === is_com) return this;
    this._is_com = is_com;
    if (emit) this._callbacks.emit("on_is_com_changed")(is_com);
    return this;
  }

  set_character_decided(is_decided: boolean, emit: boolean): this {
    if (this._character_decided === is_decided) return this;
    this._character_decided = is_decided;
    if (emit) this._callbacks.emit("on_character_decided")(is_decided);
    return this;
  }

  set_team_decided(is_decided: boolean, emit: boolean): this {
    if (this._team_decided === is_decided) return this;
    this._team_decided = is_decided;
    if (emit) this._callbacks.emit("on_team_decided")(is_decided);
    return this;
  }

  set_key(name: string, key: string, emit: boolean): this;
  set_key(name: GameKey, key: string, emit: boolean): this;
  set_key(name: GameKey, key: string, emit: boolean): this {
    if (this._info.keys[name] === key) return this;
    const prev = this._info.keys[name];
    this._info.keys[name] = key.toLowerCase();
    if (emit) this._callbacks.emit("on_key_changed")(name, key.toLowerCase(), prev);
    return this;
  }

  get_key(name: string): string | undefined;
  get_key(name: GameKey): string;
  get_key(name: GameKey): string {
    return this._info.keys[name];
  }
}