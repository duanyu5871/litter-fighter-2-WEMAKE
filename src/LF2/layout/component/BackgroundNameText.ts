import Invoker from '../../base/Invoker';
import { IBgData } from '../../defines';
import { Defines } from '../../defines/defines';
import Layout from '../Layout';
import { LayoutComponent } from "./LayoutComponent";
import Text from '../../3d/Text';

export default class BackgroundNameText extends LayoutComponent {
  private _background: IBgData = Defines.VOID_BG;

  get backgrounds(): IBgData[] {
    return this.lf2.datas.backgrounds?.filter(v => v.id !== Defines.VOID_BG.id) || []
  }
  get background(): IBgData {
    return this._background
  }
  get text(): string {
    return this._background.base.name;
  }
  protected _mesh: Text;
  protected _unmount_jobs = new Invoker();

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name)
    this._mesh = new Text(this.lf2)
      .set_center(0, 0.5)
      .set_name(BackgroundNameText.name)
      .set_style({
        fill_style: '#9b9bff',
        font: '14px Arial',
      })
  }

  override on_mount(): void {
    super.on_mount();

    this._background = this.backgrounds[0] ?? Defines.VOID_STAGE;

    this.layout.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_broadcast: (v) => {
          if (v === Defines.BuiltIn.Broadcast.SwitchBackground)
            this.switch_background()
        }
      }),
      () => this._mesh.removeFromParent(),
    )
    this._mesh.set_text(this.text).apply()
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke_and_clear();
  }

  protected switch_background() {
    const { backgrounds } = this;
    const background_id = this.background.id;
    const idx = (backgrounds.findIndex(v => v.id === background_id) + 1) % backgrounds.length;
    this._background = backgrounds[idx];
    this._mesh.set_text(this.text).apply()
  }

}