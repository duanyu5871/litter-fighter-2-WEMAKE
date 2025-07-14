import { local_random } from "../../utils/math/random";
import { Component } from "./Component";

const img_idx_list_map = new Map<string, number[]>();

export class RandomImgOnLayoutResume extends Component {
  private _img_idx_list: number[] = [];
  group?: string;

  get img_idx_list() {
    if (!this.group) return this._img_idx_list;
    else return img_idx_list_map.get(this.group) || [];
  }
  set img_idx_list(v: number[]) {
    if (!this.group) this._img_idx_list = v;
    else img_idx_list_map.set(this.group, v);
  }
  override init(...args: string[]) {
    super.init(...args);
    this.group = args[0] ? "" + args[0] : void 0;
    return this;
  }
  override on_resume(): void {
    super.on_resume?.();
    const l = this.img_idx_list;
    if (!l.length) this.node.img_infos.forEach((_, i) => l.push(i));
    if (!l.length) return;
    this.node.img_idx = Math.floor(local_random() * l.length);
    this.node.update_img();
  }
}