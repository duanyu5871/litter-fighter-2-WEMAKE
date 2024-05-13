import { IPlayerInfoCallback } from "../../LF2/PlayerInfo";
import Callbacks from "../../LF2/base/Callbacks";
import NoEmitCallbacks from "../../LF2/base/NoEmitCallbacks";
import { TKeyName } from "../../LF2/controller/BaseController";
import { LayoutComponent } from "./LayoutComponent";

export interface IGamePrepareLogicCallback {
  on_all_ready?(): void;
  on_not_ready?(): void;
  on_countdown?(v: number): void;
  on_asking_com_num?(): void;
}
export enum GamePrepareState {
  PlayerCharacterSelecting = 1,
  CountingDown = 2,
  ComputerNumberSelecting = 3,
  ComputerCharacterSelecting = 4,
  GameSetting = 5,
}

export default class GamePrepareLogic extends LayoutComponent {


  protected _callbacks = new Callbacks<IGamePrepareLogicCallback>();
  protected _joined_num: number = 0;
  protected _ready_num: number = 0;
  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: v => this.on_someone_joined_changed(v),
    on_team_decided: v => this.on_someone_team_decided(v),
  }
  protected _state: GamePrepareState = GamePrepareState.PlayerCharacterSelecting;

  get state(): GamePrepareState { return this._state; }
  protected set state(v: GamePrepareState) {
    if (this._state === v) return;
    const old = this._state;
    this.on_leave_state(old, v);
    this._state = v;
    this.on_enter_state(v, old);
  }

  private _count_down: number = 5000;
  get callbacks(): NoEmitCallbacks<IGamePrepareLogicCallback> { return this._callbacks }
  get is_all_ready() {
    return !!this._joined_num && this._joined_num === this._ready_num;
  }
  on_mount(): void {
    super.on_mount();
    for (const [, player] of this.lf2.player_infos) {
      if (player.joined) this._joined_num++;
      if (player.team_decided) this._ready_num++;
      player.callbacks.add(this._player_listener)
    }
  }
  on_unmount(): void {
    super.on_unmount();
    this._joined_num = 0;
    this._ready_num = 0;
    for (const [, player] of this.lf2.player_infos)
      player.callbacks.del(this._player_listener)
  }
  on_player_key_down(_player_id: string, key: TKeyName) {
    switch (this.state) {
      case GamePrepareState.PlayerCharacterSelecting:
        break;
      case GamePrepareState.CountingDown:
        switch (key) {
          case "j":
            this._count_down = Math.max(0, this._count_down - 500);
            break;
        }
        break;
      case GamePrepareState.ComputerNumberSelecting:
        switch (key) {
          case "j":
            for (const [, player] of this.lf2.player_infos)
              player.team_decided = false;
            this.state = GamePrepareState.PlayerCharacterSelecting
            break;
        }
        break;
      case GamePrepareState.ComputerCharacterSelecting:
        break;
      case GamePrepareState.GameSetting: break;
    }
  }
  protected on_someone_joined_changed(joined: boolean) {
    this._joined_num += (joined ? 1 : -1);
    if (joined && this._joined_num === this._ready_num + 1)
      this.on_not_ready();
    else if (!joined && this._joined_num === this._ready_num && this._joined_num)
      this.on_all_ready();
  }
  protected on_someone_team_decided(team_decided: boolean) {
    this._ready_num += (team_decided ? 1 : -1);
    if (!team_decided && this._joined_num === this._ready_num + 1)
      this.on_not_ready();
    else if (team_decided && this._joined_num === this._ready_num)
      this.on_all_ready();
  }
  protected on_all_ready(): void {
    this._callbacks.emit('on_all_ready')();
  }
  protected on_not_ready(): void {
    this._callbacks.emit('on_not_ready')();
  }
  override on_render(dt: number): void {
    switch (this.state) {
      case GamePrepareState.PlayerCharacterSelecting:
        if (this.is_all_ready) {
          this.state = GamePrepareState.CountingDown;
        }
        break;
      case GamePrepareState.CountingDown: {
        if (!this.is_all_ready) {
          this.state = GamePrepareState.PlayerCharacterSelecting;
          break;
        }
        const prev_second = Math.ceil(this._count_down / 1000);
        this._count_down -= dt
        const curr_second = Math.ceil(this._count_down / 1000);
        if (curr_second !== prev_second) {
          this._callbacks.emit('on_countdown')(curr_second);
        }
        if (this._count_down <= 0) {
          this.state = GamePrepareState.ComputerNumberSelecting;
        }
        break;
      }
      case GamePrepareState.ComputerNumberSelecting:
      case GamePrepareState.ComputerCharacterSelecting:
      case GamePrepareState.GameSetting:
    }
  }
  protected on_enter_state(state: GamePrepareState, prev: GamePrepareState) {
    switch (state) {
      case GamePrepareState.CountingDown: {
        this._count_down = 5000;
        this._callbacks.emit('on_countdown')(5);
        break;
      }
      case GamePrepareState.ComputerNumberSelecting: {
        this._callbacks.emit('on_asking_com_num')();
        const l = this.layout.find_layout('how_many_computer');
        if (l) l.visible = true;
        break;
      }
    }
  }

  protected on_leave_state(state: GamePrepareState, next: GamePrepareState) {
    switch (state) {
      case GamePrepareState.CountingDown:
      case GamePrepareState.ComputerNumberSelecting: {
        const l = this.layout.find_layout('how_many_computer');
        if (l) l.visible = false;
        break;
      }
    }
  }
}

// class Chain<T extends string> {
//   static make<T extends string>(from: T, to: T, test: () => boolean): Chain<T> {
//     return new Chain(from, to, test);
//   }
//   protected _from: T;
//   protected _to: T;
//   protected _test: () => boolean;
//   constructor(from: T, to: T, test: () => boolean) {
//     this._from = from;
//     this._to = to;
//     this._test = test;
//   }
//   get test() { return this._test }
//   get from() { return this._from }
//   get to() { return this._to }

// }

// class State<T extends string = string, D extends any = any> {
//   protected _update: () => void = () => { };
//   protected _enter: (delivery: D | null) => void = () => { };
//   protected _leave: () => void = () => { };
//   get update() { return this._update }
//   get enter() { return this._enter }
//   get leave() { return this._leave }

//   constructor(update: () => void) {
//     this._update = update;
//   }
// }

// class StateMachine<T extends string = string, D extends any = any> {
//   state_map = new Map<T, State<T, D>>()
//   state: State<T, D> | null = null;

//   set_state(next_state_id: T, delivery: D | null) {
//     const next_state = this.state_map.get(next_state_id);
//     this.state?.leave();
//     this.state = next_state || null;
//     this.state?.enter(delivery);
//   }

//   add(state_id: T, state: State<T, D>) {
//     this.state_map.set(state_id, state);
//   }

//   update() {
//     if (!this.state) return;
//     const [next_state_id, delivery] = this.state?.test();
//     if (next_state_id !== null)
//       this.set_state(next_state_id, delivery);
//     this.state?.update();
//   }
// }

// const sm = new StateMachine();

// sm.add('a', new State())
