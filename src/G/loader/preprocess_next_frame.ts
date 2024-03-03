import { TNextFrame } from '../../js_utils/lf2_type';
import { Character } from '../entity/Character';
import { get_number_predicate } from './get_number_predicate';

export const preprocess_next_frame = (i: TNextFrame) => {
  if (Array.isArray(i)) {
    i.forEach(v => preprocess_next_frame(v));
    return;
  }
  if (typeof i.condition !== 'string') return;
  const reg_result = i.condition.match(/(\S*)\s?(==|!=|<=|>=)\s?(\S*)/);
  if (!reg_result) {
    i.condition = () => false;
    return;
  }
  const [, what, operator, raw_value] = reg_result;
  if (what === 'trend_x') {
    const value = Number(raw_value);
    if (Number.isNaN(value)) {
      i.condition = () => false;
      return;
    }
    let predicate = get_number_predicate(operator, value);
    if (!predicate) {
      console.log('wrong condition', i.condition);
      predicate = (_v: number) => false;
    }
    delete i.condition;
    i.condition = (e: Character) => {
      let v: number = 0;
      if (e.velocity.x < 0) v = -e.face;
      else if (e.velocity.x > 0) v = e.face;
      return predicate(v);
    };
  } else if (what === 'presss_F_B') {
    const value = Number(raw_value);
    if (Number.isNaN(value)) {
      i.condition = () => false;
      return;
    }
    let predicate = get_number_predicate(operator, value);
    if (!predicate) {
      console.log('wrong condition', i.condition);
      predicate = (_v: number) => false;
    }
    delete i.condition;
    i.condition = (e: Character) => {
      const lr = e.controller.LR > 0 ? 1 : e.controller.LR < 0 ? -1 : 0;
      return predicate(lr * e.face);
    };
  } else {
    i.condition = () => false;
  }
};
