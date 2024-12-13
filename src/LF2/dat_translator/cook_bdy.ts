import { IBdyInfo } from '../defines';
import { is_num } from '../utils/type_check';
import { take } from './take';

export default function cook_bdy(unsafe_bdy?: Partial<IBdyInfo>): void {
  if (!unsafe_bdy) return;
  const kind = take(unsafe_bdy, 'kind');
  if (is_num(kind)) unsafe_bdy.kind = kind;
}
