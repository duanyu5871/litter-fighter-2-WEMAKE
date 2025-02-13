import { Expression } from "./Expression";

const expression_result_pairs: [1 | 0, string, any][] = [
  [0, "(1==1)&1==2", false],
  [0, "(1==1)&1==1", true],
  [0, "(1==1)&(1==2)", false],
  [0, "(1==1)&(1==1)", true],
  [0, "1==1&1==2", false],
  [0, "1==1&(((1==1)&1==1)|(1==1&1==1))|1==1", true],
  [0, "1==1&(((1==1)&1==1)|(1==1&1==1))|1==2", true],
  [0, "1==1&(((1==1)&1==1)|(1==1&1==1))&1==2", false],
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
  [0, "1==0", false],
  [0, "1==1", true],
  [0, "1==2", false],
  [0, "1{{1", true],
  [0, "1}}1", true],
  [0, "1,2{{1", true],
  [0, "1}}1,2", true],
  [0, "1,2{{3", false],
  [0, "3}}1,2", false],
];
for (const [ig, str, result] of expression_result_pairs) {
  if (ig) continue;
  test(`expression ${str} should be ${result}`, () => {
    const exp = new Expression(str, (_, a, op) => {
      switch (op) {
        case "{{":
          return a.split(",");
        case "}}":
          return a.split(",");
        case "!{":
          return a.split(",");
        case "!}":
          return a.split(",");
      }
      return a;
    });
    expect(exp.run(void 0)).toBe(result);
  });
}
