import { useState } from "react";
import { Checkbox } from "../../Component/Checkbox";
import Frame from "../../Component/Frame";
import { ArrowDown } from "../../Component/Icons/ArrowDown";
import { ArrowLeft } from "../../Component/Icons/ArrowLeft";
import { ArrowRight } from "../../Component/Icons/ArrowRight";
import { ArrowUp } from "../../Component/Icons/ArrowUp";
import { Clear, DropdownArrow, IIconProps } from "../../Component/Icons/Clear";
import { Plus } from '../../Component/Icons/Plus';
import { Cross } from '../../Component/Icons/Cross';
import { Tick } from '../../Component/Icons/Tick';
import { Search } from "../../Component/Icons/Search";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";

export default function IconDemo() {
  const [hoverable, set_hoverable] = useState(true);
  const c: IIconProps = { hoverable }
  return (
    <Frame label='Icon'>
      <Space>
        <Titled label='hoverable'>
          <Checkbox value={hoverable} onChanged={set_hoverable} />
        </Titled>
      </Space>

      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        HELLO 你好
        <Clear {...c} />
        <DropdownArrow {...c} />
        <ArrowUp {...c} />
        <ArrowDown {...c} />
        <ArrowLeft {...c} />
        <ArrowRight {...c} />
        <Search {...c} />
        <Plus {...c} />
        <Cross {...c} />
        <Tick {...c} />
      </div>
    </Frame>
  );
}
