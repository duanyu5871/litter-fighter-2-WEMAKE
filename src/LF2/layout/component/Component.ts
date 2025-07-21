import GameKey from "../../defines/GameKey";
import UINode from "../UINode";

/**
 * 组件
 * 
 * @export
 * @class Component
 */
export class Component {
  readonly node: UINode;
  readonly f_name: string;
  get lf2() {
    return this.node.lf2;
  }
  get world() {
    return this.node.lf2.world;
  }
  private _mounted: boolean = false;
  private _args: readonly string[] = [];

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
  }

  /**
   * 初始化
   *
   * @param {...string[]} args 参数
   * @returns {this} 对象本身
   */
  init(...args: string[]): this {
    this._args = args;
    return this;
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

  render?(dt: number): void;

  on_player_key_down?(player_id: string, key: GameKey): void;

  on_player_key_up?(player_id: string, key: GameKey): void;
}
