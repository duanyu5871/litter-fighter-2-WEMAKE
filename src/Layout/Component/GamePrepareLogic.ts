import { Warn } from "@fimagine/logger";
import { IPlayerInfoCallback } from "../../LF2/PlayerInfo";
import Callbacks from "../../LF2/base/Callbacks";
import NoEmitCallbacks from "../../LF2/base/NoEmitCallbacks";
import { TKeyName } from "../../LF2/controller/BaseController";
import { FSM, IReadonlyFSM } from "../StateMachine";
import { LayoutComponent } from "./LayoutComponent";

export interface IGamePrepareLogicCallback {
  on_all_ready?(): void;
  on_not_ready?(): void;
  on_countdown?(v: number): void;
  on_asking_com_num?(): void;
}
export enum GamePrepareState {
  PlayerCharacterSel = 'PlayerCharacterSelecting',
  CountingDown = 'CountingDown',
  ComNumberSel = 'ComputerNumberSelecting',
  ComputerCharacterSel = 'ComputerCharacterSelecting',
  GameSetting = 'GameSetting',
}

export default class GamePrepareLogic extends LayoutComponent {
  protected _callbacks = new Callbacks<IGamePrepareLogicCallback>();
  protected _joined_num: number = 0;
  protected _ready_num: number = 0;
  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: v => this.on_someone_joined_changed(v),
    on_team_decided: v => this.on_someone_team_decided(v),
  }
  get state(): GamePrepareState { return this._fsm.state?.key!; }

  private _count_down: number = 5000;
  get callbacks(): NoEmitCallbacks<IGamePrepareLogicCallback> { return this._callbacks }
  get is_all_ready() {
    return !!this._joined_num && this._joined_num === this._ready_num;
  }
  on_mount(): void {
    super.on_mount();
    this._fsm.use(GamePrepareState.PlayerCharacterSel)
    for (const [, player] of this.lf2.player_infos) {
      if (player.joined) this._joined_num++;
      if (player.team_decided) this._ready_num++;
      player.callbacks.add(this._player_listener)
    }
  }
  on_unmount(): void {
    super.on_unmount();
    this._joined_num = this._ready_num = 0;
    for (const [, player] of this.lf2.player_infos)
      player.callbacks.del(this._player_listener)
  }
  on_player_key_down(_player_id: string, key: TKeyName) {
    switch (this.state) {
      case GamePrepareState.PlayerCharacterSel:
        break;
      case GamePrepareState.CountingDown:
        switch (key) {
          case "j":
            this._count_down = Math.max(0, this._count_down - 500);
            this._callbacks.emit('on_countdown')(Math.ceil(this._count_down / 1000));
            break;
        }
        break;
      case GamePrepareState.ComNumberSel:
        switch (key) {
          case "a": return this._fsm.use(GamePrepareState.ComputerCharacterSel)
        }
        break;
      case GamePrepareState.ComputerCharacterSel:
        switch (key) {
          case "a": return this._fsm.use(GamePrepareState.GameSetting)
        }
        break;
      case GamePrepareState.GameSetting:
        switch (key) {
          case "j": return this._fsm.use(GamePrepareState.PlayerCharacterSel)
        }
        break;
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
    this._fsm.update(dt);
  }
  get fsm(): IReadonlyFSM<GamePrepareState> {
    return this._fsm;
  }
  private _fsm = new FSM<GamePrepareState>()
    .add({
      key: GamePrepareState.PlayerCharacterSel,
      enter: () => {
        for (const [, player] of this.lf2.player_infos) {
          player.team_decided = false;
          player.character_decided = false;
        }
      },
      update: () => {
        if (this.is_all_ready)
          return GamePrepareState.CountingDown;
      }
    }, {
      key: GamePrepareState.CountingDown,
      enter: () => {
        this._count_down = 5000;
        this._callbacks.emit('on_countdown')(5);
      },
      update: (dt) => {
        if (!this.is_all_ready)
          return GamePrepareState.PlayerCharacterSel;
        const prev_second = Math.ceil(this._count_down / 1000);
        this._count_down -= dt
        const curr_second = Math.ceil(this._count_down / 1000);
        if (curr_second !== prev_second) {
          this._callbacks.emit('on_countdown')(curr_second);
        }
        if (this._count_down <= 0)
          return GamePrepareState.ComNumberSel;
      },
      leave: () => {
        const l = this.layout.find_layout('how_many_computer');
        if (l) l.visible = false;
        else Warn.print(GamePrepareLogic.name, 'layout not found, id: how_many_computer')
      }
    }, {
      key: GamePrepareState.ComNumberSel,
      enter: () => {
        this._callbacks.emit('on_asking_com_num')();
        const l = this.layout.find_layout('how_many_computer');
        if (l) l.visible = true;
      },
      update: () => void 0,
      leave: () => {
        const l = this.layout.find_layout('how_many_computer');
        if (l) l.visible = false;
      }
    }, {
      key: GamePrepareState.ComputerCharacterSel,
      update: () => void 0,
    }, {
      key: GamePrepareState.GameSetting,
      enter: () => {
        const l = this.layout.find_layout('menu');
        if (l) l.visible = true;
      },
      update: () => void 0,
      leave: () => {
        const l = this.layout.find_layout('menu');
        if (l) l.visible = false;
      },
    }).use(GamePrepareState.PlayerCharacterSel)
}