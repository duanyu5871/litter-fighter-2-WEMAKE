/* eslint-disable eqeqeq */
import { Warn } from "../../Log";

export const get_predicate = (operator: string) => {
  const map: {
    [x in string]?: (v1: any, v2: any) => boolean;
  } = {
    '==': (v1, v2) => v1 == v2,
    '!=': (v1, v2) => v1 != v2,
    '>=': (v1, v2) => v1 >= v2,
    '<=': (v1, v2) => v1 <= v2,
  };
  if (!map[operator]) Warn.print('get_predicate', 'wrong operator:', operator);
  return map[operator] || (() => false);
};


