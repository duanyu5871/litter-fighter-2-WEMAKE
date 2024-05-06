import { Defines } from '../common/lf2_type/defines';
import Select, { ISelectProps } from './Select';
export interface TeamSelectProps extends ISelectProps<Defines.TeamEnum, string> {}
export default function TeamSelect(props: TeamSelectProps) {
  return (
    <Select
      {...props}
      items={Defines.Teams}
      option={i => [i, Defines.TeamInfoMap[i].name]} />
  );
}
