import { IWpointInfo } from '../lf2_type';
import { not_zero } from '../not_zero';
import { take } from './take';

export function cook_wpoint(unsure_wpoint: IWpointInfo) {
  const dvx = take(unsure_wpoint, 'dvx');
  if (not_zero(dvx)) unsure_wpoint.dvx = dvx * 0.5;

  const dvz = take(unsure_wpoint, 'dvz');
  if (not_zero(dvz)) unsure_wpoint.dvz = dvz;

  const dvy = take(unsure_wpoint, 'dvy');
  if (not_zero(dvy)) unsure_wpoint.dvy = dvy * -0.5;

  const attacking = take(unsure_wpoint, 'attacking');
  if (attacking) unsure_wpoint.attacking = '' + attacking;
}
