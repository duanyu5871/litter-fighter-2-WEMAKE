import Text from '../../3d/Text';
import Invoker from '../../base/Invoker';
import GameKey from '../../defines/GameKey';
import { IKeyboardCallback } from "../../ditto/keyboard/IKeyboardCallback";
import { IPointingsCallback } from "../../ditto/pointings/IPointingsCallback";
import Layout from '../Layout';
import { LayoutComponent } from './LayoutComponent';

export default class PlayerKeyEditor extends LayoutComponent {
  get player_id() { return this.args[0] || '' };
  get key_name() { return this.args[1] || '' };
  get player() { return this.lf2.player_infos.get(this.player_id) }
  protected _sprite: Text;
  protected _unmount_jobs = new Invoker();

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name);
    const [w, h] = this.layout.size
    this._sprite = new Text(this.lf2)
      .set_pos(Math.ceil(w / 2), Math.ceil(-h / 2), 1)
      .set_center(0.5, 0.5)
      .set_name(PlayerKeyEditor.name)
      .set_style({ font: '16px Arial' })
      .apply()
  }

  override on_click() {
    this.lf2.keyboard.callback.add(this.l)
    this.lf2.pointings.callback.add(this.r)
    this._sprite.set_style(v => ({ ...v, fill_style: 'blue' })).apply()
    return true;
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
    )
    this.update_sprite();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  private l: IKeyboardCallback = {
    on_key_down: e => {
      if ('escape' !== e.key.toLowerCase())
        this.player?.set_key(this.key_name, e.key).save();
      this._on_cancel();
    }
  }

  private r: IPointingsCallback = {
    on_pointer_down: () => this._on_cancel()
  }

  private _on_cancel = () => {
    this.lf2.keyboard.callback.del(this.l);
    this.lf2.pointings.callback.del(this.r);
    this._sprite?.set_style(v => ({ ...v, fill_style: 'white' })).apply()
  }

  async update_sprite() {
    const { player } = this;
    if (!player) return;
    const keycode = player.keys[this.key_name as GameKey];
    this._sprite.set_text(keycode ?? '').apply()
  }
}