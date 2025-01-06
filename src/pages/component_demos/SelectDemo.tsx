import { Dropdown } from "../../Component/Dropdown";
import Frame from "../../Component/Frame";
import Select from "../../Component/Select";
import { Space } from "../../Component/Space";

export default function SelectDemo() {
  return (
    <Frame label='Select'>
      <Space>
        <Select items={['option 0', 'option 1']} />
        <Dropdown items={['option 0', 'option 1']} parse={v => [v, v]} />
      </Space>
    </Frame>
  );
}
