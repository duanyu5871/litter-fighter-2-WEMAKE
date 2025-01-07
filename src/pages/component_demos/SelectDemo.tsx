import Frame from "../../Component/Frame";
import { Select } from "../../Component/Select";
import { Space } from "../../Component/Space";
const items: string[] = []
for (let i = 0; i < 100; ++i) {
  items.push('option ' + i);
}
export default function SelectDemo() {
  return (
    <Frame label='Select'>
      <Space>
        <Select items={items} parse={v => [v, v]} placeholder="dropdown" clearable />
      </Space>
    </Frame>
  );
}
