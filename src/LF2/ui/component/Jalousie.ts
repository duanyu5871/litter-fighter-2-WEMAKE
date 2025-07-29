import { Easing, Sequence } from "../../animation";
import { Animation } from "../../animation/Animation";
import { Sine } from "../../animation/Sine";
import { Callbacks } from "../../base";
import factory from "./Factory";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { UIComponent } from "./UIComponent";
export interface IJalousieCallbacks extends IUICompnentCallbacks {
  on_change?(v: Jalousie): void;
}
enum D {
  ns = 'ns',
  ew = 'ew',
}
export class Jalousie extends UIComponent<IJalousieCallbacks> {
  protected _direction: D = D.ew;
  protected _anim: Animation = new Sequence(
    new Easing(0, 0).set_duration(1500),
    new Sine(-1, 2, 0.5).set_duration(500),
    new Easing(1, 1).set_duration(1500),
  )
  get direction(): D { return this._direction }
  get anim(): Animation { return this._anim }
  override on_start() {
    super.on_start?.();
    const raw_direction = this.str(0);
    this._direction = [D.ns, D.ew].find(v => raw_direction === v) || D.ew
    const open = !!this.bool(1);
    const end = !!this.bool(2);
    if (end) this._anim.end(open)
    else this._anim.start(open)
    const components = factory.create(this.node,
      this._direction === D.ns ? 'vertical_layout()' : 'horizontal_layout()'
    )
    for (const component of components) {
      this.node.components.add(component)
    }
  }
  get open(): boolean { return this._anim.reverse; }
  set open(v: boolean) { this._anim.start(v); }
  get w(): number { return this.node.root.size[0] }
  get h(): number { return this.node.root.size[1] }

  override on_stop(): void {
    super.on_stop?.()
    this.callbacks.clear();
  }

  override update(dt: number): void {
    if (this._anim.done) return;
    this._anim.update(dt);
    this.update_children();
    if (this._anim.done)
      this.callbacks.emit('on_change')(this);
  }

  override on_show(): void {
    super.on_show?.()
    this._anim.calc();
    this.update_children();
  }
  _value: any = void 0;
  protected update_children() {
    const { value } = this._anim;
    const { children } = this.node;
    const len = children.length;
    for (let i = 0; i < len; i++) {
      const child = children[i];
      if (!child) continue;
      if (this._direction === 'ns') {
        child.w = this.w;
        child.scale = [1, value, 1];
      } else {
        child.h = this.h;
        child.scale = [value, 1, 1];
      }
    }
  }
}
