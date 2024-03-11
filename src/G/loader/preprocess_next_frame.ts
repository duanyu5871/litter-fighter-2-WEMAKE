import { TNextFrame } from '../../js_utils/lf2_type';
import { FrameAnimater } from '../FrameAnimater';
import { Character } from '../entity/Character';
import { Entity } from '../entity/Entity';
import { get_predicate } from './get_number_predicate';

export const preprocess_next_frame = (i: TNextFrame) => {
  if (Array.isArray(i)) {
    i.forEach(v => preprocess_next_frame(v));
    return;
  }
  if (typeof i.condition !== 'string') return;

  const lll = make_condition_list(i.condition);
  (i as any).lll = lll;
  i.condition = make_condition_func(lll[0])
};

function make_one_condition_func(str: string): (e: FrameAnimater) => any {
  const reg_result = str.match(/(\S*)\s?(==|!=|<=|>=)\s?(\S*)/);
  if (!reg_result) return () => false;
  const [, word_1, operator, word_2] = reg_result;
  const predicate = get_predicate(operator);
  const val_1 = get_val(word_1);
  const val_2 = get_val(word_2);
  return e => predicate(val_1(e), val_2(e))
}

function get_val(word: string): (e: FrameAnimater) => any {
  if (word === 'trend_x') {
    return e => {
      if (!(e instanceof Entity)) return;
      if (e.velocity.x < 0) return -e.facing;
      if (e.velocity.x > 0) return e.facing;
      return 0
    }
  }
  if (word === 'press_F_B') {
    return e => {
      if (!(e instanceof Character)) return;
      return e.controller.LR1 * e.facing;
    }
  }
  if (word === 'press_U_D') {
    return e => {
      if (!(e instanceof Character)) return;
      return e.controller.UD1;
    }
  }
  if (word === 'weapon_type') {
    return e => {
      if (!(e instanceof Entity)) return 0;
      return e.weapon?.data.base.type || 0;
    }
  }
  return e => word
}
type CCC = ((e: FrameAnimater) => boolean) | '|' | '&' | CCC[];

function make_condition_list(str: string): [CCC[], number] {
  const ret: CCC[] = [];
  str = str.replace(/\s/g, '')
  let cursor = 0;
  let i = 0
  for (; i < str.length + 1; ++i) {
    const letter = str[i]
    switch (letter) {
      case '(':
        const [res, length] = make_condition_list(str.substring(i + 1))
        i += length + 1;
        cursor = i + 1;
        ret.push(res)
        continue;
      case '|': case '&': {
        const func = make_one_condition_func(str.substring(cursor, i))
        ret.push(func, letter)
        cursor = i + 1;
        continue;
      }
      case ')':
        if (cursor < str.length) {
          const func = make_one_condition_func(str.substring(cursor, i))
          ret.push(func)
        }
        return [ret, i + 1];
      case void 0: {
        if (cursor < str.length) {
          const func = make_one_condition_func(str.substring(cursor, i))
          ret.push(func)
        }
        return [ret, i];
      }
    }
  }
  return [ret, i];
}

const make_condition_func = (arr: CCC[]) => (e: FrameAnimater): boolean => {
  let ret = false;
  let curr = false;
  for (let i = 0; i < arr.length; i += 2) {
    const item = arr[i];
    let op = i === 0 ? '|' : arr[i - 1];
    if (typeof item === 'function') {
      curr = item(e) || false;
    } else if (Array.isArray(item)) {
      curr = make_condition_func(item)(e);
    }
    if (op === '|') ret = ret || curr
    if (op === '&') ret = ret && curr
  }
  return ret
}