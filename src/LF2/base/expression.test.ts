import { Expression, IJudger } from './Expression';

const expression_result_pairs: [1 | 0, string, any][] = [
  [0, "(1=1)&1=2", false],
  [0, "(1=1)&1=1", true],
  [0, "(1=1)&(1=2)", false],
  [0, "(1=1)&(1=1)", true],
  [0, "1=1&1=2", false],
  [0, "1=1&(((1=1)&1=1)|(1=1&1=1))|1=1", true],
  [0, "1=1&(((1=1)&1=1)|(1=1&1=1))|1=2", true],
  [0, "1=1&(((1=1)&1=1)|(1=1&1=1))&1=2", false],
  [0, "1==0", false],
  [0, "1==1", true],
  [0, "1==2", false],
  [0, "1!=0", true],
  [0, "1!=1", false],
  [0, "1!=2", true],
  [0, "1>=0", true],
  [0, "1>=1", true],
  [0, "1>=2", false],
  [0, "1<=0", false],
  [0, "1<=1", true],
  [0, "1<=2", true],
  [0, "1<0", false],
  [0, "1<1", false],
  [0, "1<2", true],
  [0, "1>0", true],
  [0, "1>1", false],
  [0, "1>2", false],
  [0, "1=0", false],
  [0, "1=1", true],
  [0, "1=2", false],
]
for (const [ig, str, result] of expression_result_pairs) {
  if (ig) continue;
  test(`expression ${str} should be ${result}`, () => {
    const exp = new Expression(str, a => a);
    if ("(1=1)&1=2" === str) {
      console.log("exp.children.length", exp.children.length)
    }
    expect(exp.run(void 0)).toBe(result);
  })
}

