import Frame from "../../Component/Frame";
import { InputNumber } from "../../Component/Input";
import { Space } from "../../Component/Space";

export default function InputNumberDemo() {
  return (
    <Frame label='InputNumber'>
      <Space direction='column'>
        <InputNumber step={1} />
        <InputNumber step={1} prefix='prefix' />
        <InputNumber step={1} placeholder="placeholder" />
        <InputNumber step={1} suffix="suffix" />
        <InputNumber step={1} prefix='prefix' placeholder="placeholder" />
        <InputNumber step={1} placeholder="placeholder" suffix="suffix" />
        <InputNumber step={1} prefix='prefix' placeholder="placeholder" suffix="suffix" />
      </Space>
    </Frame>
  );
}
