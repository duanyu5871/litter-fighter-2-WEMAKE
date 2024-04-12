import type { ICharacterData } from '../../js_utils/lf2_type';
import type LF2 from '../LF2';
import Select, { ISelectProps } from './Component/Select';

export interface CharacterSelectProps extends ISelectProps<ICharacterData, string> {
  lf2?: LF2;
}
export default function CharacterSelect(props: CharacterSelectProps) {
  const { lf2, ...remains } = props;
  return (
    <Select
      items={lf2?.dat_mgr.characters}
      option={i => [i.id, i.base.name]}
      {...remains}>
      <option value=''>Random</option>
    </Select>
  );
}
