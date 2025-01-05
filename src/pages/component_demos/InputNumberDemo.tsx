import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import { Space } from "../../Component/Space";

export default function InputNumberDemo() {
  return (
    <Frame label='InputNumber'>
      <Space direction='column'>
        <Input type="number" step={1} />
        <Input type="number" step={1} prefix='prefix' />
        <Input type="number" step={1} placeholder="placeholder" />
        <Input type="number" step={1} suffix="suffix" />
        <Input type="number" step={1} prefix='prefix' placeholder="placeholder" />
        <Input type="number" step={1} placeholder="placeholder" suffix="suffix" />
        <Input type="number" step={1} prefix='prefix' placeholder="placeholder" suffix="suffix" />
      </Space>
    </Frame>
  );
}
