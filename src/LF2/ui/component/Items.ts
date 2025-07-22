import { is_num } from "../../utils";
import { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";

export class Items extends UIComponent {
  override init(...args: string[]): this {
    super.init(...args);

    // const template = args?.[0] ?? '';
    // let num = Number(args?.[1]);
    // if (!is_num(num)) num = 1;

    // const items: UINode[] = []
    // for (let i = 0; i < num; ++i) {

    //   // this.node.cook(this.lf2, {}, this.node);
    //   // this.node.add_child()
    // }
    return this;
  }
}
