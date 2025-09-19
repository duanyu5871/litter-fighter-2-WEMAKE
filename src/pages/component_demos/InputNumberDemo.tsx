import { useState } from "react";
import { Checkbox } from "../../Component/Checkbox";
import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import { InputNumber } from "../../Component/Input";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";

export default function InputNumberDemo() {
  const [clearable, set_clearable] = useState(false);
  const [prefix, set_prefix] = useState('prefix:');
  const [placeholder, set_placeholder] = useState('placeholder');
  const [suffix, set_suffix] = useState('suffix');
  return (
    <Frame label='InputNumber'>
      <Space direction='column'>
        <InputNumber step={1} prefix={prefix} placeholder={placeholder} suffix={suffix} clearable={clearable} />
        <Titled label="clearable">
          <Checkbox value={clearable} onChange={set_clearable} />
        </Titled>
        <Titled label="prefix">
          <Input value={prefix} onChange={e => set_prefix(e)} />
        </Titled>
        <Titled label="placeholder">
          <Input value={placeholder} onChange={e => set_placeholder(e)} />
        </Titled>
        <Titled label="suffix">
          <Input value={suffix} onChange={e => set_suffix(e)} />
        </Titled>      </Space>
    </Frame>
  );
}
