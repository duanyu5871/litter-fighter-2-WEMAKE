import { Button } from "../../Component/Buttons/Button";
import { Flex } from "../../Component/Flex";
import Frame from "../../Component/Frame";
import Select from "../../Component/Select";
import { TextArea } from "../../Component/TextArea";
import Titled, { ITitledProps } from "../../Component/Titled";
import { AllyFlag, BdyKind, Defines, IBdyInfo } from "../../LF2/defines";
import { floor } from "../../LF2/utils";
import { ALLY_FLAG_SELECT_PROPS, BDY_KIND_SELECT_PROPS } from "../EntityEditorView";
import { QubeEdit } from "./QubeEdit";

export interface IBdyEditorViewProps {
  label?: string;
  value?: IBdyInfo;
  defaultValue?: IBdyInfo
  onChange?(value: IBdyInfo): void;
  onRemove?(): void;
}
export function BdyEditorView(props: IBdyEditorViewProps) {
  const { label = 'bdy info', value, defaultValue = default_value, onRemove, onChange } = props;
  return (
    <Frame key={label} label={label} tabIndex={-1}>
      <Button style={{ position: 'absolute', right: 0, top: 0, border: 'none' }} onClick={onRemove}>
        🗑️
      </Button>
      <Flex direction='column' align='stretch' gap={5}>
        <Titled label='状态' styles={titled_styles}>
          <Select
            {...BDY_KIND_SELECT_PROPS}
            value={value?.kind}
            defaultValue={defaultValue.kind}
            on_changed={v => onChange?.({ ...defaultValue, ...value, kind: v ?? value?.kind ?? defaultValue.kind })}
            style={{ flex: 1 }} />
        </Titled>
        <Titled label='判定' styles={titled_styles}>
          <Select {...ALLY_FLAG_SELECT_PROPS}
            value={value?.ally_flags}
            defaultValue={defaultValue.ally_flags}
            on_changed={v => onChange?.({ ...defaultValue, ...value, ally_flags: v ?? value?.ally_flags ?? defaultValue.ally_flags })}
            style={{ flex: 1 }} />
        </Titled>
        <Titled label='包围盒' styles={titled_styles}>
          <QubeEdit
            value={value}
            defaultValue={defaultValue}
            onChange={v => onChange?.({ ...defaultValue, ...value, ...v })} />
        </Titled>
        <Titled label='条件' styles={titled_styles}>
          <TextArea
            style={{ flex: 1, resize: 'vertical' }}
            value={value?.test}
            defaultValue={defaultValue.test}
            onChange={e => onChange?.({ ...defaultValue, ...value, test: e.target.value })} />
        </Titled>
      </Flex>
    </Frame>
  )
}
const titled_styles: ITitledProps['styles'] = {
  label: {
    display: 'inline-block',
    width: 60,
    textAlign: 'center'
  }
}

const default_value: IBdyInfo = {
  ally_flags: AllyFlag.Enemy,
  kind: BdyKind.Normal,
  z: floor(-Defines.DAFUALT_QUBE_LENGTH / 2),
  l: floor(Defines.DAFUALT_QUBE_LENGTH),
  x: 0,
  y: 0,
  w: 0,
  h: 0
}
export default BdyEditorView;