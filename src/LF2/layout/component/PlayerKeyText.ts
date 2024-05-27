import Text from '../../3d/Text';
import Invoker from '../../base/Invoker';
import { TKeyName } from '../../controller/BaseController';
import Layout from '../Layout';
import { LayoutComponent } from './LayoutComponent';
import PlayerKeyEditor from './PlayerKeyEditor';

export default class PlayerKeyText extends LayoutComponent {
  get player_id() { return this.args[0] || ''; };
  get key_name() { return this.args[1] || ''; };
  get player() { return this.lf2.player_infos.get(this.player_id); }
  protected _sprite: Text;
  protected _unmount_jobs = new Invoker();

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name);
    const [w, h] = this.layout.size;
    this._sprite = new Text(this.lf2)
      .set_pos(Math.ceil(w / 2), Math.ceil(-h / 2), 1)
      .set_center(0.5, 0.5)
      .set_name(PlayerKeyEditor.name)
      .set_style({ font: '16px Arial' })
      .apply();
  }

  override on_resume() {
    super.on_resume();
    this.layout.sprite.add(this._sprite);
    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_key_changed: () => this.update_sprite()
      }),
      () => this._sprite.del_self(),
      () => this._on_cancel()
    );
    this.update_sprite();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  private _on_cancel = () => {
    this._sprite?.set_style(v => ({ ...v, fill_style: 'white' })).apply();
  };

  async update_sprite() {
    const { player } = this;
    if (!player) return;
    const keycode = player.keys[this.key_name as TKeyName];
    this._sprite.set_text(keycode ?? '').apply();
  }
}
