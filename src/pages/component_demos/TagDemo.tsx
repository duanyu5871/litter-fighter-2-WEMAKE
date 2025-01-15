import { useState } from "react";
import { Checkbox } from "../../Component/Checkbox";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { Tag } from "../../Component/Tag";
import Titled from "../../Component/Titled";

export default function TagDemo() {
  const [closeable, set_closable] = useState(false);

  return (
    <Frame label='Tag'>
      <Space>
        <Titled label='hoverable'>
          <Checkbox value={closeable} onChanged={set_closable} />
        </Titled>
      </Space>
      <Tag closeable={closeable}>
        tag demo
      </Tag>
    </Frame>
  )
}