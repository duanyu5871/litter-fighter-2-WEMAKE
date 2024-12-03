import { Warn } from '../../Log';
function ALWAY_FALSE<T = unknown>(text: string, err?: string): Judger<T> {
  return { run: () => false, text, err }
}
export interface Judger<T> {
  run(arg: T): boolean;
  text: string;
  err?: string;
}
export interface ValGetter<T> { (word: string, e: T): string | number | boolean }

const predicate_maps: { [x in string]?: (a: any, b: any) => boolean } = {
  // eslint-disable-next-line eqeqeq
  '==': (v1, v2) => v1 == v2,
  // eslint-disable-next-line eqeqeq
  '=': (v1, v2) => v1 == v2,
  // eslint-disable-next-line eqeqeq
  '!=': (v1, v2) => v1 != v2,
  '>=': (v1, v2) => v1 >= v2,
  '<=': (v1, v2) => v1 <= v2,
  '<': (v1, v2) => v1 < v2,
  '>': (v1, v2) => v1 > v2,
}
export class Expression<T> implements Judger<T> {
  readonly is_expression = true;
  static is = (v: any): v is Expression<unknown> => v?.is_expression === true;
  readonly text: string = '';
  readonly children: Array<Expression<T> | Judger<T> | '|' | '&'> = [];
  readonly get_val: (word: string, e: T) => string | number | boolean;
  err?: string | undefined;
  constructor(t: string, get_val: ValGetter<T>) {
    this.get_val = get_val;
    this.text = t.replace(/\s|\n|\r/g, '').replace(/^\(/, '');
    let p = 0;
    const count = this.text.length + 1;
    let i = 0;
    let letter: string = '';
    for (; i < count; ++i) {
      letter = this.text[i];
      if ('(' === letter) {
        const exp = new Expression<T>(this.text.substring(i), get_val);
        i += exp.text.length + 1
        p = i + 1;
        this.children.push(exp);
      } else if ('|' === letter || '&' === letter) {
        if (p < i) {
          const sub_str = this.text.substring(p, i).replace(/\)*$/g, '')
          const func = this.gen_single_judge_func(sub_str)
          this.children.push(func, letter);
        } else {
          this.children.push(letter);
        }
        p = i + 1;
      } else if (')' === letter || void 0 === letter) {
        if (p < i) {
          const sub_str = this.text.substring(p, i)
          const func = this.gen_single_judge_func(sub_str)
          this.children.push(func);
        }
        break;
      }
    }
    this.text = this.text.substring(0, i)
  }
  builtin_get_val(word: string): any {
    return word;
  }
  private gen_single_judge_func(text: string): Judger<T> {
    if (!text)
      return ALWAY_FALSE(text, '[empty text]');
    const reg_result = text.match(/(\S*)\s*(==|!=|<=|>=)\s?(\S*)/) || text.match(/(\S*)\s*(=|<|>)\s?(\S*)/);
    if (!reg_result)
      return ALWAY_FALSE(text, `[wrong expression: ${text}]`);
    const [, word_1, op, word_2] = reg_result;
    if (!word_1 || !word_2)
      return ALWAY_FALSE(text, `[wrong expression: ${text}]`);
    const predicate = predicate_maps[op];
    if (!predicate) {
      Warn.print('gen_single_judge_func', `wrong operator: ${op}`);
      return ALWAY_FALSE(text, `wrong operator: ${op}`);
    }
    return {
      run: t => predicate(
        this.get_val(word_1, t) ?? this.builtin_get_val(word_1),
        this.get_val(word_2, t) ?? this.builtin_get_val(word_2)
      ),
      text
    };
  }
  run = (e: T): boolean => {
    let ret = false;
    let cur = false;
    const len = this.children.length;
    for (let i = 0; i < len; ++i) {
      const item = this.children[i];
      if (item === '|') {
        ret = ret || cur;
      } else if (item === '&') {
        ret = ret && cur;
      } else {
        cur = item.run(e) || false;
        if (i === 0) ret = cur;
      }
    }
    return ret;
  }
}
export default Expression;