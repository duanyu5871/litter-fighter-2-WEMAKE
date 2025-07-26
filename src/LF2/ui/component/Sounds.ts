import { Defines } from "../../defines";
import { UIComponent } from "./UIComponent";

export class Sounds extends UIComponent {
  static override readonly TAG: string = 'Sounds';
  protected seq: [number, string, boolean][] = [];
  protected idx = 0;
  protected time: number = 0;
  override on_start(): void {
    const l = this.args.length;
    let t = 0;
    let s = '';
    for (let i = 0; i < l; i += 2) {
      t += this.num(i + 0) ?? 0;
      s = this.str(i + 1) ?? '';
      this.seq.push([t, s, s in Defines.BuiltIn_Sounds]);
    }
  }

  override on_resume(): void {
    this.time = 0;
    this.idx = 0;
  }
  override update(dt: number): void {
    super.update?.(dt)
    const l = this.seq.length
    if (!l) return;

    if (this.idx >= l && this.enabled) {
      this.idx = 0;
      this.time = 0;
    }

    this.time += dt;
    for (; this.idx < l; ++this.idx) {
      const [t, s, b] = this.seq[this.idx];
      if (t > this.time) break;
      if (b) this.lf2.sounds.play_with_load(s)
      else this.lf2.sounds.play_preset(s)
    }
    if (this.idx >= l) this.set_enabled(false)
  }
}
