import { type TNextFrame, TLooseGameKey } from "../defines";

export class ControllerUpdateResult {
  next_frame?: TNextFrame;
  time: number = 0;
  game_key?: TLooseGameKey;
  key_list?: string;
  set(
    next_frame: TNextFrame | undefined,
    time: number,
    game_key?: TLooseGameKey,
    key_list?: string,
  ) {
    this.next_frame = next_frame;
    this.time = time;
    this.game_key = game_key;
    this.key_list = key_list;
  }
}
