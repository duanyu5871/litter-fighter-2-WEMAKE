import { Warn } from '../../Log';

const ALWAY_FALSE = () => false
interface JudgeFunc<T> { (arg: T): boolean }

export class Condition<T> {
  readonly text: string = '';
  readonly children: Array<JudgeFunc<T> | '|' | '&' | Condition<T>> = [];
  readonly get_val: (word: string) => (e: T) => any;
  constructor(text: string, get_val: (word: string) => (e: T) => any) {
    this.get_val = get_val;
    this.text = text = text.replace(/\s|\n|\r/g, '');
    let p = 0;
    const count = text.length + 1;
    for (let i = 0; i < count; ++i) {
      const letter = text[i];
      switch (letter) {
        case '(':
          const res = new Condition<T>(text.substring(i + 1), get_val);
          i += res.text.length + 2;
          p = i + 1;
          this.children.push(res);
          continue;
        case ')':
          if (p < text.length)
            this.children.push(this.gen_single_judge_func(text.substring(p, i)));
          this.text = text.substring(0, i);
          return;
        case '|': case '&':
          this.children.push(this.gen_single_judge_func(text.substring(p, i)), letter);
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
      this.get_val(word_1)(t),
      this.get_val(word_2)(t)
    );
  }
  make(): JudgeFunc<T> {
    return e => {
      let ret = false;
      let cur = false;
      const len = this.children.length;
      for (let i = 0; i < len; i += 2) {
        const item = this.children[i];
        let op = i === 0 ? '|' : this.children[i - 1];
        if (typeof item === 'function') {
          cur = item(e) || false;
        } else if (item instanceof Condition) {
          cur = item.make()(e);
        }
        if (op === '|') ret = ret || cur;
        if (op === '&') ret = ret && cur;
      }
      return ret;
    };
  }
}
