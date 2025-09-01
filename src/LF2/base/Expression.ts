import { BinOp, TBinOp } from "../defines/BinOp";
import {
  IExpression,
  IJudger,
  IValGetter,
  IValGetterGetter,
} from "../defines/IExpression";
import Ditto from "../ditto";
export function ALWAY_FALSE<T = unknown>(
  text: string,
  err?: string,
): IJudger<T> {
  return { run: () => false, text, err };
}
const a_included_b = (a: any[], b: any[]) => {
  return !b.length || b.findIndex((i) => a.indexOf(i) < 0) === -1;
};
export const predicate_maps: Record<BinOp, (a: any, b: any) => boolean> = {
  // eslint-disable-next-line eqeqeq
  "==": (a, b) => a == b,
  // eslint-disable-next-line eqeqeq
  "!=": (a, b) => a != b,
  ">=": (a, b) => a >= b,
  "<=": (a, b) => a <= b,
  "<": (a, b) => a < b,
  ">": (a, b) => a > b,
  "{{": a_included_b,
  "}}": (a: any[], b: any[]) => a_included_b(b, a),
  "!{": (a: any[], b: any[]) => a_included_b(a, b),
  "!}": (a: any[], b: any[]) => !a_included_b(b, a),
};

export class Expression<T1, T2 = T1> implements IExpression<T1, T2> {
  readonly is_expression = true;
  static is = (v: any): v is Expression<unknown> => v?.is_expression === true;
  readonly text: string = "";
  readonly children: IExpression<T1, T2>[] = [];
  // readonly get_val?: IValGetter<T1 | T2>;
  readonly get_val_getter: IValGetterGetter<T1 | T2>;
  readonly err?: string | undefined;
  before: string = "";
  not: boolean = false;
  constructor(
    text: string,
    get_val_getter: IValGetterGetter<T1 | T2>,
  );
  constructor(
    run: IJudger<T1 | T2>,
    get_val_getter: IValGetterGetter<T1 | T2>,
  );
  constructor(
    arg_0: string | IJudger<T1 | T2>,
    get_val_getter: IValGetterGetter<T1 | T2>,
  ) {
    this.get_val_getter = get_val_getter;
    if (typeof arg_0 === "string") {
      this.text = arg_0.replace(/\s|\n|\r/g, "");
      let p = 0;
      const count = this.text.length + 1;
      let i = 0;
      let letter: string = "";
      let before: string = "";
      for (; i < count; ++i) {
        letter = this.text[i] || '';
        if ("!" === letter && this.text[i] === "(") {
          const child = new Expression<T1, T2>(
            this.text.substring(i + 2),
            get_val_getter,
          );
          child.not = true;
          child.before = before;
          i += child.text.length + 2;
          p = i + 2;
          this.children.push(child);
        } else if ("(" === letter) {
          const child = new Expression<T1, T2>(
            this.text.substring(i + 1),
            get_val_getter,
          );
          child.before = before;
          i += child.text.length + 1;
          p = i + 1;
          this.children.push(child);
        } else if ("|" === letter || "&" === letter) {
          if (p < i) {
            const sub_str = this.text.substring(p, i).replace(/\)*$/g, "");
            const judger = this.gen_judger(sub_str);
            const child = new Expression<T1, T2>(judger, get_val_getter);
            child.before = before;
            this.children.push(child);
            before = letter;
          } else {
            before = letter;
          }
          p = i + 1;
        } else if (")" === letter || '' === letter) {
          if (p < i) {
            const sub_str = this.text.substring(p, i);
            const judger = this.gen_judger(sub_str);
            const child = new Expression<T1, T2>(judger, get_val_getter);
            child.before = before;
            this.children.push(child);
          }
          break;
        }
      }
      this.text = this.text.substring(0, i);
    } else {
      Object.assign(this, arg_0);
    }
  }
  private gen_judger(text: string): IJudger<T1> {
    if (!text) return ALWAY_FALSE(text, "[empty text]");
    const reg_result =
      text.match(/(\S*)\s*(==|!=|<=|>=|\{\{|\}\}|!\{|!\})\s?(\S*)/) ||
      text.match(/(\S*)\s*(=|<|>)\s?(\S*)/);
    if (!reg_result) return ALWAY_FALSE(text, `[wrong expression: ${text}]`);
    const [, word_1, op, word_2] = reg_result;
    if (!word_1 || !word_2)
      return ALWAY_FALSE(text, `[wrong expression: ${text}]`);
    const predicate = predicate_maps[op as TBinOp];
    if (!predicate) {
      Ditto.warn("gen_single_judge_func", `wrong operator: ${op}`);
      return ALWAY_FALSE(text, `wrong operator: ${op}`);
    }
    const getter_1 = this.get_val_getter(word_1);
    const getter_2 = this.get_val_getter(word_2);
    let val_1: any = word_1;
    let val_2: any = word_2;
    if (op === "{{" || op === "}}" || op === "!{" || op === "!}") {
      if (!getter_1) val_1 = word_1.split(",");
      if (!getter_2) val_2 = word_2.split(",");
    }
    if (!getter_1 && !getter_2) {
      const result = predicate(val_1, val_2);
      console.warn(
        "[Expression] warning,",
        JSON.stringify(text),
        "always got",
        result,
      );
      return {
        run: () => result,
        text,
      };
    }
    return {
      run: (t) =>
        predicate(
          getter_1 ? getter_1(t, word_1, op as BinOp) : val_1,
          getter_2 ? getter_2(t, word_2, op as BinOp) : val_2,
        ),
      text,
    };
  }
  run = (e: T1): boolean => {
    let ret = false;
    const len = this.children.length;
    for (let i = 0; i < len; ++i) {
      const child = this.children[i]!;
      if (!child.before) {
        ret = child.run(e);
      } else if (child.before === "|") {
        ret = ret || child.run(e);
      } else if (child.before === "&") {
        ret = ret && child.run(e);
      }
    }
    return this.not ? !ret : ret;
  };
}