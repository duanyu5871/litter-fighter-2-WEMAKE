import { Sequence } from "../../animation";
import { Sine } from "../../animation/Sine";
import { Callbacks } from "../../base";
import factory from "./Factory";
import { UIComponent } from "./UIComponent";
export interface IJalousieCallbacks {
  on_change?(v: Jalousie): void;
}
export class Jalousie extends UIComponent {
  callbacks = new Callbacks<IJalousieCallbacks>();
  direction: 'ns' | 'ew' = 'ew';
  sine = new Sequence(
    1500,
    new Sine(-1, 2, 0.5).set_duration(500),
    1500,
  )
  override init(...args: string[]): this {
    super.init(...args);
    const raw_direction: string | undefined = args[0]
    switch (raw_direction) {
      case 'ns':
      case 'ew':
        this.direction = raw_direction;
        break;
      default:
        this.direction = 'ew';
        break;
    }
    const raw_open: string | undefined = args[1]
    switch (raw_open) {
      case '0':
      case 'false':
      case void 0:
        this.sine.reverse = false;
        break;
      default:
        this.sine.reverse = true
        break;
    }
    const components = factory.create(this.node,
      this.direction === 'ns' ? 'vertical_layout()' : 'horizontal_layout()'
    )
    for (const component of components) {
      this.node.components.add(component)
    }
    return this;
  }
  get open(): boolean { return this.sine.reverse }
  set open(v: boolean) { this.sine.reverse = v }
  get w(): number { return this.node.root.size[0] }
  get h(): number { return this.node.root.size[1] }

  override on_stop(): void {
    super.on_stop?.()
    this.callbacks.clear();
  }

  override update(dt: number): void {
    if (this.sine.reach_end) return;
    this.sine.update(dt);
    this.update_children();
    if (this.sine.reach_end)
      this.callbacks.emit('on_change')(this);
  }

  override on_show(): void {
    super.on_show?.()
    this.sine.calc();
    this.update_children();
  }

  protected update_children() {
    const { value } = this.sine;
    const { children } = this.node;
    const len = children.length;
    for (let i = 0; i < len; i++) {
      const child = children[i];
      if (!child) continue;
      if (this.direction === 'ns') {
        child.w = this.w;
        child.scale = [1, value, 1];
      } else {
        child.h = this.h;
        child.scale = [value, 1, 1];
      }
    }
  }
}
