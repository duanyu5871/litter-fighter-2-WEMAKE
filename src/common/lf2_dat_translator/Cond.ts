import { is_str } from '../../LF2/utils/type_check';

export class Cond<T extends string = string> {
  readonly is_cond = true;
  static is = (v: any): v is Cond => v?.is_cond === true;

  static readonly get = <T extends string = string>() => new Cond<T>();
  static readonly add = <T extends string = string>(...args: Parameters<Cond<T>['add']>) => this.get<T>().add(...args);
  static readonly one_of = <T extends string = string>(...args: Parameters<Cond<T>['one_of']>) => this.get<T>().one_of(...args);
  static readonly not_in = <T extends string = string>(...args: Parameters<Cond<T>['not_in']>) => this.get<T>().not_in(...args);
  static readonly bracket = <T extends string = string>(...args: Parameters<Cond<T>['bracket']>) => this.get<T>().bracket(...args);

  private _parts: (string | Cond)[] = [];
  add(word: T, op: '==' | '>=' | '<=' | '!=', value: any): this {
    this._parts.push(`${word}${op}${value}`);
    return this;
  }
  bracket(func: (c: Cond) => Cond): this {
    this._parts.push(func(Cond.get()));
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
  private _any(word?: T | ((c: Cond) => Cond), op?: '==' | '>=' | '<=' | '!=' | (string | number)[], value?: any): this {
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
  or(func: (c: Cond) => Cond): this;
  or(word: T, op: '==' | '>=' | '<=' | '!=', value: any): this;
  or(word?: T | ((c: Cond) => Cond), op?: '==' | '>=' | '<=' | '!=' | (string | number)[], value?: any): this {
    this._parts.length && this._parts.push('|');
    return this._any(word, op, value);
  }

  and(): this;
  and(func: (c: Cond) => Cond): this;
  and(word: T, op: '==' | '>=' | '<=' | '!=', value: any): this;
  and(word?: T | ((c: Cond) => Cond), op?: '==' | '>=' | '<=' | '!=', value?: any): this {
    this._parts.length && this._parts.push('&');
    return this._any(word, op, value);
  }
  done(): string {
    let ret = this._parts.map(v => is_str(v) ? v : `(${v.done()})`).join('');
    ret = ret.replace(/\s|\n|\r/g, ''); // remove empty char;

    // remove redundant bracket;
    if (this._parts.length === 1 && Cond.is(this._parts[0]))
      ret = ret.replace(/^\(|\)$/g, '');
    return ret;
  }
}
