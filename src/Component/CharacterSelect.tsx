import { useEffect, useMemo, useState } from 'react';
import type LF2 from '../LF2/LF2';
import type { ICharacterData } from '../common/lf2_type';
import Select, { ISelectProps } from './Select';

export interface CharacterSelectProps extends ISelectProps<ICharacterData, string> {
  lf2: LF2;
  show_all?: boolean;
}
export default function CharacterSelect(props: CharacterSelectProps) {
  const { lf2, disabled, show_all = false, ...remains } = props;
  const [characters, set_characters] = useState<ICharacterData[]>(lf2.datas.characters);

  useEffect(() => {
    set_characters(lf2.datas.characters);
    return lf2.callbacks.add({
      on_loading_end: () => set_characters(lf2.datas.characters),
    })
  }, [lf2])

  const items = useMemo(() => show_all ? characters : characters.filter(v => !v.base.hidden), [characters, show_all])

  return (
    <Select
      items={items}
      disabled={!characters?.length || disabled}
      option={i => [i.id, i.base.name]}
      {...remains}>
      <option value=''>Random</option>
    </Select>
  );
}
