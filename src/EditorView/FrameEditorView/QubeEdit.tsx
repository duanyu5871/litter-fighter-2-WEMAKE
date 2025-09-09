import Combine from "../../Component/Combine";
import { Input, InputProps } from "../../Component/Input";
import { fixed_float } from "../../LF2/dat_translator/fixed_float";
import { IQube } from "../../LF2/defines/IQube";
import { Unsafe } from "../../LF2/utils";

export interface IQubeEditProps {
  defaultValue?: IQube;
  value?: IQube;
  onChange?(value: IQube): void;
}
export function QubeEdit(props: IQubeEditProps) {
  const {
    value,
    defaultValue = empty_qube,
    onChange
  } = props;

  return (
    <Combine direction="column" style={{ flex: 1, alignItems: 'stretch' }}>
      <Combine style={{ width: '100%' }}>
        <Input {...g_input_props('x', value, defaultValue, onChange)} title="X" prefix="X" />
        <Input {...g_input_props('y', value, defaultValue, onChange)} title="Y" prefix="Y" />
        <Input {...g_input_props('z', value, defaultValue, onChange)} title="Z" prefix="Z" />
      </Combine>
      <Combine style={{ width: '100%' }}>
        <Input {...g_input_props('w', value, defaultValue, onChange)} min={0} title="宽" prefix="宽" />
        <Input {...g_input_props('h', value, defaultValue, onChange)} min={0} title="高" prefix="高" />
        <Input {...g_input_props('l', value, defaultValue, onChange)} min={0} title="长" prefix="长" />
      </Combine>
    </Combine>
  );
}

const empty_qube: IQube = {
  z: 0,
  l: 0,
  x: 0,
  y: 0,
  w: 0,
  h: 0
}
const default_input_props: InputProps = {
  type: "number",
  step: 1,
  precision: 1,
  styles: { prefix: { display: 'inline-block', width: 20, textAlign: 'center' } },
  style: { flex: 1 }
};
(default_input_props as any)['data-flex'] = 1;
const g_input_props = (k: keyof IQube, value: Unsafe<IQube>, defaultValue: IQube, onChange: IQubeEditProps['onChange']): InputProps => {
  return {
    ...default_input_props,
    value: value?.[k],
    defaultValue: defaultValue?.[k],
    onChange: e => onChange?.({ ...defaultValue, ...value, [k]: fixed_float(Number(e.target.value)) })
  }
}