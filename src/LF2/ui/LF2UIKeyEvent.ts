import { TLooseGameKey } from "../defines";
import { IUIKeyEvent } from "./IUIKeyEvent";
import { LF2UIEvent } from "./LF2UIEvent";

export class LF2UIKeyEvent extends LF2UIEvent implements IUIKeyEvent {
  protected _player: string;
  protected _key: TLooseGameKey;
  protected _key_code: string;
  get player(): string { return this._player; }
  get game_key(): TLooseGameKey { return this._key; }
  get key(): string { return this._key_code; }
  constructor(player: string, key: TLooseGameKey, key_code: string = key) {
    super();
    this._player = player;
    this._key = key;
    this._key_code = key_code;
  }
}
