import { is_positive_num } from '../is_positive_num';
import { IBdyInfo } from '../lf2_type';
import { take } from './take';

export default function cook_bdy(unsafe_bdy?: Partial<IBdyInfo>) {
  if (!unsafe_bdy) return;

  const kind = take(unsafe_bdy, 'kind');
  if(is_positive_num(kind)) unsafe_bdy.kind = kind;

}
