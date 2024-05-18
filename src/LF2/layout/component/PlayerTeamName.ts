import { SineAnimation } from '../../animation/SineAnimation';
import Invoker from '../../base/Invoker';
import { Defines } from '../../defines/defines';
import Layout from '../Layout';
import { LayoutComponent } from "./LayoutComponent";
import Text from './Text';

/**
 * 显示玩家队伍名
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerTeamName extends LayoutComponent {
  get player_id() { return this.args[0] || '' }
  get player() { return this.lf2.player_infos.get(this.player_id) }
  get decided() { return !!this.player?.team_decided }
  get text(): string {
    const team = this.player?.team || '';
    return Defines.TeamInfoMap[team]?.name || '';
  }
  protected _mesh: Text;
  protected _opacity: SineAnimation = new SineAnimation(0.65, 1, 1 / 25);
  protected _unmount_jobs = new Invoker()

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name)
    const [w, h] = this.layout.size
    this._mesh = new Text(this.lf2)
      .set_pos(w / 2, -h / 2)
      .set_center(0.5, 0.5)
      .set_name(PlayerTeamName.name)
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
        on_character_decided: () => this.handle_changed(),
        on_team_changed: () => this.handle_changed(),
      }),
      () => this._mesh.removeFromParent()
    )
    this.handle_changed();
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
  }

  protected handle_changed() {
    this._mesh.set_visible(!!this.player?.character_decided).set_text(this.text).apply();
  }
  
  on_render(dt: number): void {
    this._opacity.update(dt)
    this._mesh.opacity = this.decided ? 1 : this._opacity.value;

  }
}