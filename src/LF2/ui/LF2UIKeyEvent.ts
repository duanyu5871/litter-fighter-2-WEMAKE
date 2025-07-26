import { TLooseGameKey } from "../defines";
import { IUIKeyEvent } from "./IUIKeyEvent";
import { LF2UIEvent } from "./LF2UIEvent";

export class LF2UIKeyEvent extends LF2UIEvent implements IUIKeyEvent {
  protected _player: string;
  protected _key: TLooseGameKey;
  get player(): string { return this._player; }
  get key(): TLooseGameKey { return this._key; }
  constructor(player: string, key: TLooseGameKey) {
    super();
    this._player = player;
    this._key = key;
  }
}
