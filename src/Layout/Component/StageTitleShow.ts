import Invoker from "../../LF2/base/Invoker";
import Stage from "../../LF2/stage/Stage";
import NumberAnimation from "../../common/animation/NumberAnimation";
import SequenceAnimation from '../../common/animation/SequenceAnimation';
import { is_str } from "../../common/type_check";
import read_nums from "../utils/read_nums";
import { LayoutComponent } from "./LayoutComponent";
import Sprite from "./Sprite";

export default class StageTitleShow extends LayoutComponent {
  protected _unmount_jobs = new Invoker();
  private _opactiy: SequenceAnimation = new SequenceAnimation(
    new NumberAnimation(0, 1, 500),
    3000,
    new NumberAnimation(1, 0, 500)
  );
  private _sprites: Sprite[] = [];

  private depose_all_mesh() {
    for (const mesh of this._sprites)
      mesh.dispose();
    this._sprites.length = 0;
  }

  protected async on_stages_clear() {
    this.lf2.sounds.play_preset('pass')
    this.depose_all_mesh();
    const meshs = [await this.create_sp(`stage_clear`)]
    const parent_mesh = this.layout.sprite;
    if (!parent_mesh || meshs.indexOf(void 0) >= 0 || !this.mounted) {
      for (const mesh of meshs) mesh?.dispose();
      return;
    }

    let total_w = 0;
    let total_h = 0;
    for (const mesh of this._sprites) {
      total_w += mesh.w;
      total_h = Math.max(total_h, mesh.h);
    }
    let x = this.layout.w / 2 - total_w / 2;
    let y = -(this.layout.h / 2 - total_h / 2);
    for (const sprite of this._sprites) {
      sprite.set_pos(x, y);
      x += sprite.w;
      parent_mesh.add(sprite);
    }
    this._opactiy.play(false);
  }

  protected async on_stage_change(stage: Stage) {
    this.depose_all_mesh();

    const [, main_num, sub_num] = stage.name.match(/stage (\d*)-(\d*)/) ?? [];
    if (!is_str(main_num) || !is_str(sub_num)) return;
    const sps = [
      await this.create_sp(`state_name_prefix`),
      await this.create_sp(`char_minus`).then(v => { if (v) v.visible = false; return v }),
      await this.create_sp(`char_num_${main_num}`),
      await this.create_sp(`char_minus`),
      await this.create_sp(`char_num_${sub_num}`),
    ]

    const parent_sprite = this.layout.sprite;
    if (!parent_sprite || sps.indexOf(void 0) >= 0 || this.lf2.world.stage !== stage || !this.mounted) {
      for (const sp of sps) sp?.dispose();
      return;
    }

    this._sprites = sps.filter(v => v) as Sprite[];
    let total_w = 0;
    let total_h = 0;
    for (const mesh of this._sprites) {
      total_w += mesh.w;
      total_h = Math.max(total_h, mesh.h);
    }
    let x = this.layout.w / 2 - total_w / 2;
    let y = -(this.layout.h / 2 - total_h / 2);
    for (const sprite of this._sprites) {
      sprite.set_pos(x, y);
      x += sprite.w;
      parent_sprite.add(sprite);
    }
    this._opactiy.play(false);
  }
  async create_sp(rect_name: string) {
    const raw_rect = this.layout.get_value(rect_name);
    const [x, y, w, h] = read_nums(raw_rect, 4);
    if (w <= 0 || h <= 0) return;
    const char_num_img = this.layout.get_value('char_num_img');
    if (!is_str(char_num_img)) return;
    const key = char_num_img + rect_name;
    const num_pic = await this.lf2.images.create_pic(key, char_num_img, { src_x: x, src_y: y, src_w: w, src_h: h });
    const num_mesh = new Sprite(num_pic)
      .set_opacity(0)
      .set_size(w, h)
    return num_mesh;
  }

  on_mount(): void {
    super.on_mount();
    this._unmount_jobs.add(
      this.world.callbacks.add({
        on_stage_change: v => this.on_stage_change(v),
      }),
      this.lf2.callbacks.add({
        on_stages_clear: () => this.on_stages_clear()
      })
    )
  }

  on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
    this.depose_all_mesh();
  }

  on_render(dt: number): void {
    if (this._sprites.length) {
      this._opactiy.update(dt);
      for (const m of this._sprites)
        m.opacity = this._opactiy.value;
    }
  }
}