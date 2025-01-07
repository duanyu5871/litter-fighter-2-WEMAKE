import { useState } from "react";
import { Checkbox } from "../../Component/Checkbox";
import Frame from "../../Component/Frame";
import { Clear, DropdownArrow } from "../../Component/Icons/Clear";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";

export default function IconDemo() {
  const [hoverable, set_hoverable] = useState(true);
  return (
    <Frame label='Icon'>
      <Space>
        <Titled label='hoverable'>
          <Checkbox value={hoverable} onChanged={set_hoverable} />
        </Titled>
      </Space>
      <Space>
        <Clear hoverable={hoverable} />
        <DropdownArrow hoverable={hoverable} />
      </Space>
    </Frame>
  );
}
