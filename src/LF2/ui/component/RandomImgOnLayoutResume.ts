import { UIComponent } from "./UIComponent";

const img_idx_list_map = new Map<string, number[]>();

export class RandomImgOnLayoutResume extends UIComponent {
  static override readonly TAG = 'RandomImgOnLayoutResume'
  private _img_idx_list: number[] = [];

  get group() { return this.str(0) };
  get img_idx_list() {
    if (!this.group) return this._img_idx_list;
    else return img_idx_list_map.get(this.group) || [];
  }
  set img_idx_list(v: number[]) {
    if (!this.group) this._img_idx_list = v;
    else img_idx_list_map.set(this.group, v);
  }
  override on_resume(): void {
    super.on_resume?.();
    const l = this.img_idx_list;
    if (!l.length) this.node.data.img.forEach((_, i) => l.push(i));
    if (!l.length) return;
    this.node.img_idx.value = this.lf2.random_in(0, l.length);
  }
}