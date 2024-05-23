import Text from '../../3d/Text';
import { SineAnimation } from '../../animation/SineAnimation';
import Invoker from '../../base/Invoker';
import Layout from '../Layout';
import GamePrepareLogic, { GamePrepareState } from './GamePrepareLogic';
import { LayoutComponent } from "./LayoutComponent";

/**
 * 显示玩家名称
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerName extends LayoutComponent {
  protected get player_id() { return this.args[0] || '' }
  protected get player() { return this.lf2.player_infos.get(this.player_id) }
  protected get text(): string {
    const { player } = this;
    if (player?.is_com) return 'Computer'
    if (player?.joined) return player.name
    if (this.gpl?.state === GamePrepareState.PlayerCharacterSel) return 'Join?';
    return ''
  }
  get joined(): boolean { return true === this.player?.joined }
  get is_com(): boolean { return true === this.player?.is_com }
  get gpl(): GamePrepareLogic | undefined { return this.layout.root.find_component(GamePrepareLogic) }
  protected _mesh: Text;
  protected _opacity: SineAnimation = new SineAnimation(0.65, 1, 1 / 25);
  protected _unmount_jobs = new Invoker();

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name)
    const [w, h] = this.layout.size
    this._mesh = new Text(this.lf2)
      .set_pos(w / 2, -h / 2)
      .set_center(0.5, 0.5)
      .set_name(PlayerName.name)
      .set_style({
        fill_style: 'white',
        font: '14px Arial',
      })
  }

  override on_mount(): void {
    super.on_mount();

    this.layout.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_is_com_changed: () => this.handle_changed(),
        on_joined_changed: () => this.handle_changed(),
        on_name_changed: () => this.handle_changed(),
      }),
      this.gpl?.fsm.callbacks.add({
        on_state_changed: () => this.handle_changed()
      }),
      () => this._mesh.removeFromParent(),
    )
    this.handle_changed();
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    switch (this.gpl?.state) {
      case GamePrepareState.PlayerCharacterSel:
        this._mesh.visible = true;
        break;
      case GamePrepareState.CountingDown:
      case GamePrepareState.ComNumberSel:
        this._mesh.visible = this.joined;
        break;
      case GamePrepareState.ComputerCharacterSel:
      case GamePrepareState.GameSetting:
        this._mesh.visible = this.joined || this.is_com;
        break;
    }
    this._mesh.set_style(v => ({
      ...v, fill_style: this.is_com ? 'pink' : 'white'
    })).set_text(this.text).apply()
  }

  on_render(dt: number): void {
    this._opacity.update(dt)
    this._mesh.opacity = this.joined ? 1 : this._opacity.value;
  }
}