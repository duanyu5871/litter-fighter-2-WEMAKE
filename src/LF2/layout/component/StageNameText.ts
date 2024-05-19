import Invoker from '../../base/Invoker';
import { IStageInfo } from '../../defines';
import { Defines } from '../../defines/defines';
import Layout from '../Layout';
import { LayoutComponent } from "./LayoutComponent";
import Text from './Text';

export default class StageNameText extends LayoutComponent {
  private _stage: IStageInfo = Defines.VOID_STAGE;

  get stages(): IStageInfo[] {
    return this.lf2.stages.data?.filter(v => v.id !== Defines.VOID_STAGE.id) || []
  }
  get stage(): IStageInfo {
    return this._stage
  }
  get text(): string {
    return this._stage.name;
  }
  protected _mesh: Text;
  protected _unmount_jobs = new Invoker();

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name)
    this._mesh = new Text(this.lf2)
      .set_center(0.5, 0.5)
      .set_name(StageNameText.name)
      .set_style({
        fill_style: 'white',
        font: '14px Arial',
      })
  }

  override on_mount(): void {
    super.on_mount();

    this._stage = this.stages[0] ?? Defines.VOID_STAGE;

    this.layout.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_broadcast: (v) => {
          if (v === Defines.BuiltIn.Broadcast.SwitchStage)
            this.switch_stage()
        }
      }),
      () => this._mesh.removeFromParent(),
    )
    this._mesh.set_text(this.text).apply()
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
  }

  protected switch_stage() {
    const { stages } = this;
    const state_id = this.stage.id;
    const idx = (stages.findIndex(v => v.id === state_id) + 1) % stages.length;
    this._stage = stages[idx];

    this._mesh.set_text(this.text).apply()
  }

}