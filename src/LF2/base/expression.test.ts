import { Expression } from './Expression';

const expression_result_pairs: [string, boolean][] = [
  // ["1=1&(((1=1)&1=1)|(1=1&1=1))|1=1", true],
  // ["1=1&(((1=1)&1=1)|(1=1&1=1))|1=2", true],
  ["1=1&(((1=1)&1=1)|(1=1&1=1))&1=2", false],
  // ["1==0", false],
  // ["1==1", true],
  // ["1==2", false],

  // ["1!=0", true],
  // ["1!=1", false],
  // ["1!=2", true],

  // ["1>=0", true],
  // ["1>=1", true],
  // ["1>=2", false],

  // ["1<=0", false],
  // ["1<=1", true],
  // ["1<=2", true],

  // ["1<0", false],
  // ["1<1", false],
  // ["1<2", true],

  // ["1>0", true],
  // ["1>1", false],
  // ["1>2", false],

  // ["1=0", false],
  // ["1=1", true],
  // ["1=2", false],
]
for (const [str, result] of expression_result_pairs) {
  test(`expression ${str} should be ${result}`, () => {
    expect(new Expression(str, a => a).run(void 0)).toBe(result);
  })
}
