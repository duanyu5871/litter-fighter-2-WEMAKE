import { Callbacks } from "../../base";
import Ditto from "../../ditto";
import { IDebugging, make_debugging } from "../../entity/make_debugging";
import { is_num } from "../../utils";
import { IUIKeyEvent } from "../IUIKeyEvent";
import type { UINode } from "../UINode";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
/**
 * 组件
 * 
 * @export
 * @class Component
 */
export class UIComponent<Callbacks extends IUICompnentCallbacks = IUICompnentCallbacks> implements IDebugging {
  static readonly TAG: string = "UIComponent"
  readonly node: UINode;
  readonly f_name: string;
  readonly callbacks = new Callbacks<Callbacks>()

  __debugging?: boolean | undefined;
  debug(func: string, ...args: any[]): void { }
  log(func: string, ...args: any[]): void { }
  id: string = '';
  get lf2() {
    return this.node.lf2;
  }
  get world() {
    return this.node.lf2.world;
  }
  private _mounted: boolean = false;
  private _args: readonly any[] = [];
  private _enabled: boolean = true;

  get enabled() { return this._enabled; }
  set enabled(v: boolean) { this.set_enabled(v); }
  set_enabled(v: boolean): this {
    this._enabled = v;
    return this;
  }
  get mounted() {
    return this._mounted;
  }

  get args(): readonly string[] {
    return this._args;
  }


  /**
   * 组件基类构造函数
   *
   * @constructor
   * @protected
   * @param {UINode} layout 布局对象
   * @param {string} f_name 组件在工厂中的名字
   */
  constructor(layout: UINode, f_name: string) {
    this.node = layout;
    this.f_name = f_name;
    make_debugging(this)
  }

  /**
   * 初始化
   *
   * @param {...any[]} args 参数
   * @returns {this} 对象本身
   */
  init(...args: any[]): this {
    this._args = args;
    return this;
  }
  num(idx: number): number | null {
    if (idx >= this._args.length) return null;
    const num = Number(this._args[idx]);
    return is_num(num) ? num : null;
  }
  str(idx: number): string | null {
    if (idx >= this._args.length) return null;
    return '' + this._args[idx]
  }
  bool(idx: number): boolean | null {
    const str = this.str(idx)?.toLowerCase();
    if (!str) return false
    return !['false', '0'].some(v => v === str);
  }
  warn(func: string, msg: string) {
    Ditto.Warn(`[${this.node_name}][<${this.id}>${this.f_name}::${func}] ${msg}`)
  }
  nums(idx: number, length: 1): [number] | null
  nums(idx: number, length: 2): [number, number] | null
  nums(idx: number, length: 3): [number, number, number] | null
  nums(idx: number, length: number): number[] | null;
  nums(idx: number, length: number): number[] | null {
    if (idx >= this._args.length) return null;
    let raw = this._args[idx];
    raw = typeof raw === 'string' ? raw.split(',') : raw
    if (Array.isArray(raw)) {
      if (raw.length < length) {
        this.warn(`num2`, `args[${idx}].length < 2!`)
        return null
      }
      const unsafe_nums = raw.map(v => Number(v));
      const ret: number[] = []
      for (let i = 0; i < length; i++) {
        const unsafe_num = unsafe_nums[i];
        if (!is_num(unsafe_num)) {
          this.warn(`num2`, `args[${idx}][${i}] is not a number, but got ${raw[i]}`)
          return null
        }
        ret.push(unsafe_num)
      }
      return ret
    } else {
      this.warn(`num2`, `args[${idx}] got ${raw}, can not parse to num2`)
      return null
    }
  }

  get node_name() {
    return this.node.name ?? this.node.id ?? 'no_name'
  }

  /**
   * Description placeholder
   *
   * @returns {(boolean | void)} 
   */
  on_click?(): boolean | void;

  on_start?(): void;

  on_resume(): void {
    this._mounted = true;
  }
  on_pause(): void {
    this._mounted = false;
  }
  on_stop?(): void;

  on_show?(): void;

  on_hide?(): void;

  on_blur?(): void;

  on_foucs?(): void;

  update?(dt: number): void;

  on_key_down?(e: IUIKeyEvent): void;

  on_key_up?(e: IUIKeyEvent): void;
}
