import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import Select from "../../Component/Select";
import { Space } from "../../Component/Space";
import { TextArea } from "../../Component/TextArea";
import Titled from "../../Component/Titled";
import { IBdyInfo } from "../../LF2/defines";
import { BDY_KIND_SELECT_PROPS } from "../EntityEditorView";

export interface IBdyEditorViewProps {
  label: string;
  value: IBdyInfo;
  onChange?(value: IBdyInfo): void;
  onRemove?(): void;
}
export function BdyEditorView(props: IBdyEditorViewProps) {
  const { label, value, onRemove, onChange } = props;
  return (
    <Frame key={label} label={label} tabIndex={-1}>
      <Button style={{ position: 'absolute', right: 0, top: 0, border: 'none' }} onClick={onRemove}>
        🗑️
      </Button>
      <Space direction="column">
        <Titled label='　　状态'>
          <Select {...BDY_KIND_SELECT_PROPS} />
        </Titled>
        <Titled label='碰撞测试' style={{ display: 'flex' }}>
          <TextArea style={{ flex: 1, resize: 'vertical' }} value={value.test} onChange={e => onChange?.({ ...value, test: e.target.value })} />
        </Titled>
        <Titled label='　包围盒'>
          <Combine direction="column">
            <Combine>
              <Input type="number" value={value.x} onChange={e => onChange?.({ ...value, x: Number(e.target.value) })} title="x" prefix="x" style={{ width: 80 }} />
              <Input type="number" value={value.y} onChange={e => onChange?.({ ...value, y: Number(e.target.value) })} title="y" prefix="y" style={{ width: 80 }} />
              <Input type="number" value={value.z} onChange={e => onChange?.({ ...value, z: Number(e.target.value) })} title="z" prefix="z" style={{ width: 80 }} />
            </Combine>
            <Combine>
              <Input type="number" value={value.w} onChange={e => onChange?.({ ...value, w: Number(e.target.value) })} title="w" prefix="w" style={{ width: 80 }} />
              <Input type="number" value={value.h} onChange={e => onChange?.({ ...value, h: Number(e.target.value) })} title="h" prefix="h" style={{ width: 80 }} />
              <Input type="number" value={value.l} onChange={e => onChange?.({ ...value, l: Number(e.target.value) })} title="l" prefix="l" style={{ width: 80 }} />
            </Combine>
          </Combine>
        </Titled>
      </Space>
    </Frame>
  );
}
