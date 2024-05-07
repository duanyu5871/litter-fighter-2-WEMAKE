import { Warn } from '@fimagine/logger';
import { is_str } from '../common/is_str';
import Callbacks, { NoEmitCallbacks } from './base/Callbacks';
import { TKeyName, TKeys } from './controller/BaseController';

const default_keys_list: TKeys[] = [
  { L: 'a', R: 'd', U: 'w', D: 's', a: 'r', j: 't', d: 'y' },
  { L: 'j', R: 'l', U: 'i', D: 'k', a: '[', j: ']', d: '\\' },
  { L: 'arrowleft', R: 'arrowright', U: 'arrowup', D: 'arrowdown', a: '0', j: '.', d: 'enter' },
  { L: '4', R: '6', U: '8', D: '5', a: '/', j: '*', d: '-' },
  { L: '', R: '', U: '', D: '', a: '', j: '', d: '' }
]
const get_default_keys = (i: number) => default_keys_list[i - 1] || default_keys_list[default_keys_list.length - 1];

export interface IPlayerInfoCallback {
  on_key_changed?(key_name: TKeyName, value: string, prev: string): void;
  on_name_changed?(player_name: string, prev: string): void;
  on_character_changed?(character_id: string, prev: string): void;
  on_team_changed?(team: string, prev: string): void;
  on_joined_changed?(joined: boolean): void;
  on_character_decided?(is_decided: boolean): void;
  on_team_decided?(is_decided: boolean): void;
  on_is_com_changed?(is_com: boolean): void;
}
export interface PurePlayerInfo {
  id: string;
  name: string;
  keys: TKeys;
  team: string;
  character: string;
  version: number;
}
export class PlayerInfo {
  protected _callbacks = new Callbacks<IPlayerInfoCallback>();
  protected _info: PurePlayerInfo;
  protected _joined: boolean = false;
  protected _is_com: boolean = false;
  protected _team_decided: boolean = false;
  protected _character_decided: boolean = false;


  get id(): string { return this._info.id; }
  get name(): string { return this._info.name; }
  get keys(): TKeys { return this._info.keys; }

  get team(): string { return this._info.team; }
  set team(v: string) { this.set_team(v); }

  get character(): string { return this._info.character }
  set character(v: string) { this.set_character(v) }

  get callbacks(): NoEmitCallbacks<IPlayerInfoCallback> { return this._callbacks }

  get joined(): boolean { return this._joined; }
  set joined(v: boolean) { this.set_joined(v); }

  get is_com(): boolean { return this._is_com; }
  set is_com(v: boolean) { this.set_is_com(v); }

  get team_decided(): boolean { return this._team_decided; }
  set team_decided(v: boolean) { this.set_team_decided(v); }

  get character_decided(): boolean { return this._character_decided; }
  set character_decided(v: boolean) { this.set_character_decided(v); }

  constructor(id: string, name: string = id, keys: TKeys = get_default_keys(Number(id))) {
    this._info = { id, name, keys, team: '', version: 0, character: '' };
    this.load();
  }

  private get storage_key() { return 'player_info_' + this._info.id; }

  save(): void {
    localStorage.setItem(this.storage_key, JSON.stringify(this._info));
  }

  load(): boolean {
    const str = localStorage.getItem(this.storage_key);
    if (!str) return false;
    try {
      const { name, keys, team, version, character } = JSON.parse(str) as Partial<PurePlayerInfo>;
      if (version !== this._info.version) {
        Warn.print(PlayerInfo.name, 'version changed');
        return false;
      }
      this._info.name = is_str(name) ? name : this._info.name;
      this._info.keys = keys ? keys : this._info.keys;
      this._info.team = is_str(team) ? team : this._info.team;
      this._info.character = is_str(character) ? character : this._info.character;
      return true;
    } catch (e) {
      Warn.print(PlayerInfo.name, 'load failed, ', e);
      return false;
    }
  }

  set_name(name: string): this {
    if (this._info.name === name) return this;
    const prev = this._info.name;
    this._info.name = name
    this._callbacks.emit('on_name_changed')(name, prev);
    return this;
  }

  set_character(character: string): this {
    if (this._info.character === character) return this;
    const prev = this._info.character;
    this._info.character = character
    this._callbacks.emit('on_character_changed')(character, prev);
    return this;
  }

  set_team(team: string): this {
    if (this._info.team === team) return this;
    const prev = this._info.team;
    this._info.team = team
    this._callbacks.emit('on_team_changed')(team, prev);
    return this;
  }

  set_joined(joined: boolean): this {
    if (this._joined === joined) return this;
    this._joined = joined
    this._callbacks.emit('on_joined_changed')(joined);
    return this;
  }

  set_is_com(is_com: boolean): this {
    if (this._is_com === is_com) return this;
    this._is_com = is_com
    this._callbacks.emit('on_is_com_changed')(is_com);
    return this;
  }

  set_character_decided(is_decided: boolean): this {
    if (this._character_decided === is_decided) return this;
    this._character_decided = is_decided
    this._callbacks.emit('on_character_decided')(is_decided);
    return this;
  }

  set_team_decided(is_decided: boolean): this {
    if (this._team_decided === is_decided) return this;
    this._team_decided = is_decided
    this._callbacks.emit('on_team_decided')(is_decided);
    return this;
  }

  set_key(name: string, key: string): this
  set_key(name: TKeyName, key: string): this;
  set_key(name: TKeyName, key: string): this {
    if (this._info.keys[name] === key) return this;
    const prev = this._info.keys[name];
    this._info.keys[name] = key.toLowerCase();
    this._callbacks.emit('on_key_changed')(name, key.toLowerCase(), prev);
    return this;
  }

  get_key(name: string): string | undefined;
  get_key(name: TKeyName): string;
  get_key(name: TKeyName): string {
    return this._info.keys[name];
  }
}
