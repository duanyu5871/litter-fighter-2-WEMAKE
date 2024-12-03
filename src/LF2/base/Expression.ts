import { Warn } from '../../Log';
const ALWAY_FALSE = () => false
export interface JudgeFunc<T> { (arg: T): boolean }
export interface ValGetter<T> { (word: string, e: T): string | number | boolean }
export class Expression<T> {
  readonly is_expression = true;
  static is = (v: any): v is Expression<unknown> => v?.is_expression === true;

  readonly text: string = '';
  readonly children: Array<JudgeFunc<T> | '|' | '&'> = [];
  readonly get_val: (word: string, e: T) => string | number | boolean;
  constructor(text: string, get_val: ValGetter<T>) {
    this.get_val = get_val;
    this.text = text = text.replace(/\s|\n|\r/g, '');
    let p = 0;
    const count = text.length + 1;
    for (let i = 0; i < count; ++i) {
      const letter = text[i];
      switch (letter) {
        case '(':
          const res = new Expression<T>(text.substring(i + 1), get_val);
          i += res.text.length + 2;
          p = i + 1;
          this.children.push(res.make());
          continue;
        case ')':
          if (p < text.length)
            this.children.push(this.gen_single_judge_func(text.substring(p, i)));
          this.text = text.substring(0, i);
          return;
        case '|':
        case '&':
          const sub_str = text.substring(p, i)
          this.children.push(this.gen_single_judge_func(sub_str), letter);
          p = i + 1;
          continue;
        case void 0: {
          if (p < text.length) {
            this.children.push(this.gen_single_judge_func(text.substring(p, i)));
          }
          return;
        }
      }
    }
  }
  builtin_get_val(word: string): any {
    return word;
  }
  private gen_single_judge_func(str: string): JudgeFunc<T> {
    const reg_result = str.match(/(\S*)\s?(==|!=|<=|>=)\s?(\S*)/);
    if (!reg_result) return ALWAY_FALSE;
    const [, word_1, op, word_2] = reg_result;
    const predicate = {
      // eslint-disable-next-line eqeqeq
      '==': (v1: any, v2: any) => v1 == v2,
      // eslint-disable-next-line eqeqeq
      '!=': (v1: any, v2: any) => v1 != v2,
      '>=': (v1: any, v2: any) => v1 >= v2,
      '<=': (v1: any, v2: any) => v1 <= v2,
    }[op];
    if (!predicate) {
      Warn.print('gen_single_judge_func', 'wrong operator:', op);
      return ALWAY_FALSE;
    }
    return t => predicate(
      this.get_val(word_1, t) ?? this.builtin_get_val(word_1),
      this.get_val(word_2, t) ?? this.builtin_get_val(word_2)
    );
  }
  make(): JudgeFunc<T> {
    return e => {
      let ret = false;
      let cur = false;
      const len = this.children.length;
      for (let i = 0; i < len; ++i) {
        const item = this.children[i];
        if (typeof item === 'function') {
          cur = item(e) || false;
          if (i === 0) ret = cur;
        } else if (item === '|') {
          ret = ret || cur;
        } else if (item === '&') {
          ret = ret && cur;
        }
      }
      return ret;
    };
  }
}
export default Expression;