import { is_str } from '../utils/type_check';
export type TOperator = '==' | '>=' | '<=' | '!=' | '<' | '>'
export class CondMaker<T extends string = string> {
  readonly is_cond = true;
  static is = (v: any): v is CondMaker => v?.is_cond === true;

  static readonly get = <T extends string = string>() => new CondMaker<T>();
  static readonly add = <T extends string = string>(...args: Parameters<CondMaker<T>['add']>) => this.get<T>().add(...args);
  static readonly one_of = <T extends string = string>(...args: Parameters<CondMaker<T>['one_of']>) => this.get<T>().one_of(...args);
  static readonly not_in = <T extends string = string>(...args: Parameters<CondMaker<T>['not_in']>) => this.get<T>().not_in(...args);
  static readonly bracket = <T extends string = string>(...args: Parameters<CondMaker<T>['bracket']>) => this.get<T>().bracket(...args);

  private _parts: (string | CondMaker)[] = [];
  add(word: T, op: TOperator, value: any): this {
    this._parts.push(`${word}${op}${value}`);
    return this;
  }
  bracket(func: (c: CondMaker) => CondMaker): this {
    this._parts.push(func(CondMaker.get()));
    return this;
  }
  one_of(word: T, ...values: (string | number)[]): this {
    return this.bracket(c => {
      for (const v of values) c = c.or(word, '==', v);
      return c;
    });
  }
  not_in(word: T, ...values: (string | number)[]): this {
    return this.bracket(c => {
      for (const v of values) c.add(word, '!=', v);
      return c;
    });
  }
  private _any(word?: T | ((c: CondMaker) => CondMaker), op?: TOperator | (string | number)[], value?: any): this {
    if (typeof word === 'function')
      return this.bracket(word);
    else if (word !== void 0)
      if (Array.isArray(op))
        return this.one_of(word, ...op);
      else if (op !== void 0 && value !== void 0)
        return this.add(word, op, value);
    return this;
  }
  or(): this;
  or(func: (c: CondMaker) => CondMaker): this;
  or(word: T, op: TOperator, value: any): this;
  or(word?: T | ((c: CondMaker) => CondMaker), op?: TOperator | (string | number)[], value?: any): this {
    this._parts.length && this._parts.push('|');
    return this._any(word, op, value);
  }

  and(): this;
  and(func: (c: CondMaker) => CondMaker): this;
  and(word: T, op: TOperator, value: any): this;
  and(word?: T | ((c: CondMaker) => CondMaker), op?: TOperator, value?: any): this {
    this._parts.length && this._parts.push('&');
    return this._any(word, op, value);
  }
  done(): string {
    let ret = this._parts.map(v => is_str(v) ? v : `(${v.done()})`).join('');
    ret = ret.replace(/\s|\n|\r/g, ''); // remove empty char;

    // remove redundant bracket;
    if (this._parts.length === 1 && CondMaker.is(this._parts[0]))
      ret = ret.replace(/^\(|\)$/g, '');
    return ret;
  }
}
