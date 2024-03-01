export class ColonValueReader {
  private _cells: [string, 'str' | 'num' | 'num_2'][] = [];
  str(name: string): this { this._cells.push([name, 'str']); return this; }
  num(name: string): this { this._cells.push([name, 'num']); return this; }
  num_2(name: string): this { this._cells.push([name, 'num_2']); return this; }
  reg_exp(flags?: string): RegExp {
    let str = '';
    for (const [n, t] of this._cells) {
      switch (t) {
        case 'str': str += `${n}\\s*:\\s*(\\S+)[\\s|\\n]*`; break;
        case 'num': str += `${n}\\s*:\\s*(\\d+)[\\s|\\n]*`; break;
        case 'num_2': str += `${n}\\s*:\\s*(\\d+)\\s*(\\d+)[\\s|\\n]*`; break;
      }
    }
    return new RegExp(str, flags);
  }
  read(text: string): any {
    const result = this.reg_exp().exec(text);
    if (!result) return null;
    const ret: any = {};
    let pos = 1;
    for (const [n, t] of this._cells) {
      switch (t) {
        case 'str':
          ret[n] = result[pos];
          pos += 1;
          break;
        case 'num':
          ret[n] = Number(result[pos]);
          pos += 1;
          break;
        case 'num_2':
          ret[n] = [Number(result[pos]), Number(result[pos + 1])];
          pos += 2;
          break;
      }
    }
    return ret;
  }
}
