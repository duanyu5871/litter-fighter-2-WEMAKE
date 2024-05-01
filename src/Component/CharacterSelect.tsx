import { useMemo } from 'react';
import type { ICharacterData } from '../common/lf2_type';
import type LF2 from '../LF2/LF2';
import Select, { ISelectProps } from './Select';

export interface CharacterSelectProps extends ISelectProps<ICharacterData, string> {
  lf2?: LF2;
  show_hidden?: boolean;
}
export default function CharacterSelect(props: CharacterSelectProps) {
  const { lf2, disabled, show_hidden, ...remains } = props;
  const characters = lf2?.dat_mgr.characters;
  const items = useMemo(() => characters?.filter(v => !v.base.hidden), [characters])
  return (
    <Select
      items={show_hidden ? characters : items}
      disabled={!characters?.length || disabled}
      option={i => [i.id, i.base.name]}
      {...remains}>
      <option value=''>Random</option>
    </Select>
  );
}
