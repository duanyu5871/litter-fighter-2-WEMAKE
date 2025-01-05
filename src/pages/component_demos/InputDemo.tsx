import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import { Space } from "../../Component/Space";

export default function InputDemo() {
  return (
    <Frame label='Input'>
      <Space direction='column'>
        <Input />
        <Input prefix='prefix' />
        <Input placeholder="placeholder" />
        <Input suffix="placeholder" />
        <Input prefix='prefix' placeholder="placeholder" />
        <Input placeholder="placeholder" suffix="suffix" />
        <Input prefix='prefix' placeholder="placeholder" suffix="suffix" />
      </Space>
    </Frame>
  )
}
