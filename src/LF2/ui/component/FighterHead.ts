import { ISprite } from "../../3d/ISprite";
import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { Defines } from "../../defines/defines";
import Ditto from "../../ditto";
import { PlayerInfo } from "../../PlayerInfo";
import { between } from "../../utils";
import GamePrepareLogic, { GamePrepareState } from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";

/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class FighterHead
 * @extends {UIComponent}
 */
export default class FighterHead extends UIComponent {
  static override readonly TAG = 'FighterHead'
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get player(): PlayerInfo { return this.lf2.players.get(this.player_id)!; }

  get head() {
    const character_id = this.player?.character;
    if (!character_id) return Defines.BuiltIn_Imgs.RFACE;
    const head = this.lf2.datas.find_character(character_id)?.base.head;
    return head ?? Defines.BuiltIn_Imgs.RFACE;
  }

  protected _opacity: Sine = new Sine(0.65, 1, 6);
  protected readonly _mesh_head: ISprite;
  get countdown_node() { return this.node.find_child("countdown_text") }
  get hints_node() { return this.node.find_child("hints") }
  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }

  protected _unmount_jobs = new Invoker();

  constructor(...args: ConstructorParameters<typeof UIComponent>) {
    super(...args);
    this._mesh_head = new Ditto.SpriteNode(this.lf2)
      .set_center(0.5, 0.5)
      .set_position(this.node.w / 2, -this.node.h / 2, 0.1)
      .set_name("head")
      .apply();
  }
  override on_resume(): void {
    super.on_resume();

    this.node.renderer.sprite.add(
      this._mesh_head,
    )
    this._unmount_jobs.add(
      () =>
        this.node.renderer.sprite.del(
          this._mesh_head,
        ),
      this.player?.callbacks.add({
        on_joined_changed: () => this.handle_changed(),
        on_character_changed: () => this.handle_changed(),
        on_random_character_changed: () => this.handle_changed(),
      }),
      this.gpl?.callbacks.add({
        on_countdown: (seconds) => {
          if (between(seconds, 1, 5))
            this.countdown_node!.txt_idx.value = (seconds - 1);
        },
      }),
      this.gpl?.fsm.callbacks.add({
        on_state_changed: () => this.handle_changed(),
      }),
    );
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    this.lf2.images.p_create_pic_by_img_key(this.head).then(pic => {
      this._mesh_head.set_info(pic).apply();
    });
  }

  override update(dt: number): void {
    this._opacity.update(dt);
    if (this.hints_node) this.hints_node.opacity = this._opacity.value;

    switch (this.gpl?.state!) {
      case GamePrepareState.Player:
        this.hints_node!.visible = !this.player.joined;
        this._mesh_head.visible = this.player.joined;
        this.countdown_node!.visible = false;
        break;
      case GamePrepareState.CountingDown:
        this.hints_node!.visible = false;
        this._mesh_head.visible = this.player.joined;
        this.countdown_node!.visible = !this.player.joined;
        break;
      case GamePrepareState.ComNumberSel:
        this._mesh_head.visible = this.player.joined;
        this.hints_node!.visible = false;
        this.countdown_node!.visible = false;
        break;
      case GamePrepareState.Computer:
        this.hints_node!.visible = !this.player.joined && this.player.is_com;
        this._mesh_head.visible = this.player.joined;
        this.countdown_node!.visible = false;
        break;
      case GamePrepareState.GameSetting:
        this._mesh_head.visible = this.player.joined;
        this.hints_node!.visible = false;
        this.countdown_node!.visible = false;
        break;
    }
  }
}
