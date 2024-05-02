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
  on_name_changed?(value: string, prev: string): void;
  on_character_changed?(value: string, prev: string): void;
  on_team_changed?(value: string, prev: string): void;
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
  private _callbacks = new Callbacks<IPlayerInfoCallback>();
  private info: PurePlayerInfo;
  get id() { return this.info.id; }
  get name() { return this.info.name; }
  get keys() { return this.info.keys; }
  get team() { return this.info.team; }
  get character() { return this.info.character }
  get callbacks(): NoEmitCallbacks<IPlayerInfoCallback> {
    return this._callbacks
  }

  constructor(id: string, name: string, keys: TKeys = get_default_keys(Number(id))) {
    this.info = { id, name, keys, team: '', version: 0, character: '' };
    this.load();
  }

  private get storage_key() { return 'player_info_' + this.info.id; }

  save(): void {
    localStorage.setItem(this.storage_key, JSON.stringify(this.info));
  }

  load(): boolean {
    const str = localStorage.getItem(this.storage_key);
    if (!str) return false;
    try {
      const { name, keys, team, version, character } = JSON.parse(str) as Partial<PurePlayerInfo>;
      if (version !== this.info.version) {
        Warn.print(PlayerInfo.name, 'version changed');
        return false;
      }
      this.info.name = is_str(name) ? name : this.info.name;
      this.info.keys = keys ? keys : this.info.keys;
      this.info.team = is_str(team) ? team : this.info.team;
      this.info.character = is_str(character) ? character : this.info.character;
      return true;
    } catch (e) {
      Warn.print(PlayerInfo.name, 'load failed, ', e);
      return false;
    }
  }
  set_name(name: string): this {
    if (this.info.name === name) return this;
    const prev = this.info.name;
    this._callbacks.emit('on_name_changed')(this.info.name = name, prev);
    return this;
  }
  set_character(character: string): this {
    if (this.info.character === character) return this;
    const prev = this.info.character;
    this._callbacks.emit('on_character_changed')(this.info.character = character, prev);
    return this;
  }
  set_team(team: string): this {
    if (this.info.team === team) return this;
    const prev = this.info.team;
    this._callbacks.emit('on_team_changed')(this.info.team = team, prev);
    return this;
  }

  set_key(name: string, key: string): this
  set_key(name: TKeyName, key: string): this;
  set_key(name: TKeyName, key: string): this {
    if (this.info.keys[name] === key) return this;
    const prev = this.info.keys[name];
    this.info.keys[name] = key.toLowerCase();
    this._callbacks.emit('on_key_changed')(name, key.toLowerCase(), prev);
    return this;
  }

  get_key(name: string): string | undefined;
  get_key(name: TKeyName): string;
  get_key(name: TKeyName): string {
    return this.info.keys[name];
  }
}
