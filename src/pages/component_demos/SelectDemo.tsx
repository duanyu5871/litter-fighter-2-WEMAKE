import Frame from "../../Component/Frame";
import Select from "../../Component/Select";
import { Space } from "../../Component/Space";

export default function SelectDemo() {
  return (
    <Frame label='Select'>
      <Space>
        <Select items={['option 0', 'option 1']} />
      </Space>
    </Frame>
  );
}
