import __Sprite from "../../../DittoImpl/3d/__Sprite";
import Easing from "../../animation/Easing";
import Sequence from "../../animation/Sequence";
import Invoker from "../../base/Invoker";
import Ditto from "../../ditto";
import Stage from "../../stage/Stage";
import { is_str } from "../../utils/type_check";
import read_nums from "../utils/read_nums";
import { Component } from "./Component";

export default class StageTitleShow extends Component {
  protected _unmount_jobs = new Invoker();
  private _opactiy: Sequence = new Sequence(
    new Easing(0, 1, 500),
    3000,
    new Easing(1, 0, 500),
  );
  private _sprites: __Sprite[] = [];

  private depose_all_mesh() {
    for (const mesh of this._sprites) mesh.dispose();
    this._sprites.length = 0;
  }

  protected async on_stages_clear() {
    this.lf2.sounds.play_preset("pass");
    this.depose_all_mesh();
    const meshs = [await this.create_sp(`stage_clear`)];
    const parent_mesh = this.node.sprite;
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
    let x = this.node.w / 2 - total_w / 2;
    let y = -(this.node.h / 2 - total_h / 2);
    for (const sprite of this._sprites) {
      sprite.set_position(x, y);
      x += sprite.w;
      parent_mesh.add(sprite);
    }
    this._opactiy.play(false);
  }

  protected async on_stage_change(stage: Stage) {
    this.depose_all_mesh();

    const [, main_num, sub_num] =
      stage.name.match(/stage (\d*)-(\d*)/) ??
      stage.name.match(/(\d*)-(\d*)/) ??
      [];
    if (!is_str(main_num) || !is_str(sub_num)) return;
    const sps = [
      await this.create_sp(`state_name_prefix`),
      await this.create_sp(`char_minus`).then((v) => {
        if (v) v.visible = false;
        return v;
      }),
      await this.create_sp(`char_num_${main_num}`),
      await this.create_sp(`char_minus`),
      await this.create_sp(`char_num_${sub_num}`),
    ];

    const parent_sprite = this.node.sprite;
    if (
      !parent_sprite ||
      sps.indexOf(void 0) >= 0 ||
      this.lf2.world.stage !== stage ||
      !this.mounted
    ) {
      for (const sp of sps) sp?.dispose();
      return;
    }

    this._sprites = sps.filter((v) => v) as __Sprite[];
    let total_w = 0;
    let total_h = 0;
    for (const mesh of this._sprites) {
      total_w += mesh.w;
      total_h = Math.max(total_h, mesh.h);
    }
    let x = this.node.w / 2 - total_w / 2;
    let y = -(this.node.h / 2 - total_h / 2);
    for (const sprite of this._sprites) {
      sprite.set_position(x, y);
      x += sprite.w;
      parent_sprite.add(sprite);
    }
    this._opactiy.play(false);
  }
  async create_sp(rect_name: string) {
    const raw_rect = this.node.get_value(rect_name);
    const [x, y, w, h] = read_nums(raw_rect, 4);
    if (w <= 0 || h <= 0) return;
    const char_num_img = this.node.get_value("char_num_img");
    if (!is_str(char_num_img)) return;
    const key = char_num_img + rect_name;
    const num_pic = await this.lf2.images.create_pic(key, char_num_img, [{
      type: 'crop',
      x: x,
      y: y,
      w: w,
      h: h,
    }]);
    const num_mesh = new Ditto.SpriteNode(this.lf2, num_pic)
      .set_opacity(0)
      .set_size(w, h);
    return num_mesh;
  }
  override on_start(): void {
    super.on_start?.();
    this.on_stage_change(this.world.stage)
  }
  override on_resume(): void {
    super.on_resume();
    this._unmount_jobs.add(
      this.world.callbacks.add({
        on_stage_change: (v) => this.on_stage_change(v),
      }),
    );
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
    this.depose_all_mesh();
  }

  override render(dt: number): void {
    if (this._sprites.length) {
      this._opactiy.update(dt);
      for (const m of this._sprites) m.opacity = this._opactiy.value;
    }
  }
}
