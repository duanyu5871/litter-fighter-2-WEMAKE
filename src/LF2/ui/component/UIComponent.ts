import { Callbacks } from "../../base";
import { Ditto } from "../../ditto";
import { IDebugging, make_debugging } from "../../entity/make_debugging";
import { is_num, is_str } from "../../utils";
import { IComponentInfo } from "../IComponentInfo";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { IUIPointerEvent } from "../IUIPointerEvent";
import type { UINode } from "../UINode";
import read_nums from "../utils/read_nums";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";

class UIProperties {
  readonly raw: any;
  constructor(raw: any) { this.raw = raw }
  num(name: string): number | null {
    if (!(name in this.raw)) return null
    const v = this.raw[name];
    return is_num(v) ? v : null;
  }
  str<T extends string = string>(name: string, one_of?: T[]): T | null {
    if (!(name in this.raw)) return null
    const ret: T = this.raw[name];
    if (!is_str(ret)) return null
    if (!one_of?.length) return ret;
    if (one_of.some(a => a === ret)) return ret
    return null
  }
  bool(name: string): boolean | null {
    if (!(name in this.raw)) return null
    const v = this.raw[name];
    return !['false', '0'].some(b => b === '' + v);
  }


  nums(name: string, len: 4, fallbacks?: number[]): [number, number, number, number]
  nums(name: string, len: 3, fallbacks?: number[]): [number, number, number]
  nums(name: string, len: 2, fallbacks?: number[]): [number, number]
  nums(name: string, len: 1, fallbacks?: number[]): [number]
  nums(name: string, len: number, fallbacks?: number[]): number[]
  nums(name: string, len: number, fallbacks?: number[]): number[] {
    return read_nums(this.raw[name], len, fallbacks)
  }
}
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
  readonly info: Required<IComponentInfo>;

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

  readonly props: UIProperties
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
   * @param {IComponentInfo} info
   */
  constructor(layout: UINode, f_name: string, info: Required<IComponentInfo>) {
    this.node = layout;
    this.f_name = f_name;
    this.info = info;
    this.props = new UIProperties(info.properties)
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
    Ditto.warn(`[${this.node_name}][<${this.id}>${this.f_name}::${func}] ${msg}`)
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

  on_click?(e: IUIPointerEvent): void;

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

  update?(dt: number): void

  on_key_down?(e: IUIKeyEvent): void;

  on_key_up?(e: IUIKeyEvent): void;
}
