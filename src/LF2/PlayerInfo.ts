import { Warn } from '@fimagine/logger';
import { TKeyName, TKeys } from './controller/BaseController';
export interface IPlayerInfoCallback {
  on_key_changed?(key_name: TKeyName, value: string, prev: string): void;
  on_name_changed?(value: string, prev: string): void;
}
export class PlayerInfo {
  private _callbacks = new Set<IPlayerInfoCallback>()
  private _id: string;
  private _name!: string;
  private _keys!: TKeys;
  get id() { return this._id; }
  get name() { return this.get_name(); }
  get keys() { return this._keys; }
  constructor(id: string, name: string, keys: TKeys) {
    this._id = id;
    if (!this.load()) {
      this._name = name;
      this._keys = keys;
      this.save();
    }
  }
  private get storage_key() { return 'player_info_' + this._id; }
  save() {
    localStorage.setItem(this.storage_key, JSON.stringify(this));
  }
  load() {
    const str = localStorage.getItem(this.storage_key);
    if (!str) return false;
    try {
      const { _name, _keys } = JSON.parse(str);
      this._name = _name;
      this._keys = _keys;
      return true;
    } catch (e) {
      Warn.print(PlayerInfo.name, 'load failed, ', e);
      return false;
    }
  }
  set_name(name: string): this {
    if (this._name === name) return this;
    const prev = this._name;
    this._name = name;
    for (const c of this._callbacks)
      c.on_name_changed?.(name, prev);
    return this;
  }
  get_name(): string {
    return this._name;
  }


  set_key(name: string, key: string): this
  set_key(name: TKeyName, key: string): this;
  set_key(name: TKeyName, key: string): this {
    if (this._keys[name] === key) return this;
    const prev = this._keys[name];
    this._keys[name] = key.toLowerCase();
    for (const c of this._callbacks)
      c.on_key_changed?.(name, key, prev);
    return this;
  }

  get_key(name: string): string | undefined;
  get_key(name: TKeyName): string;
  get_key(name: TKeyName): string {
    return this._keys[name];
  }

  add_callback(callback: IPlayerInfoCallback): this {
    this._callbacks.add(callback);
    return this;
  }
  del_callback(callback: IPlayerInfoCallback): this {
    this._callbacks.delete(callback);
    return this;
  }
}
