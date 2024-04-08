import { Warn } from '@fimagine/logger';
import { TKeys } from './controller/BaseController';

export class PlayerInfo {
  private _id: string;
  private _name!: string;
  private _keys!: TKeys;
  get id() { return this._id; }
  get name() { return this._name; }
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
}
