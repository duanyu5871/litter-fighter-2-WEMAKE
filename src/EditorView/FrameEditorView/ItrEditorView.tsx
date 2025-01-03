import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import Select from "../../Component/Select";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";
import { IItrInfo } from "../../LF2/defines";
import { ITR_EFFECT_SELECT_PROPS, ITR_KIND_SELECT_PROPS } from "../EntityEditorView";

export function ItrEditorView(props: { label: string, value: IItrInfo; onChange?(value: IItrInfo): void; onRemove?(): void; }) {
  const { value, onRemove, onChange, label } = props;
  return (
    <Frame tabIndex={-1} label={label}>
      <Button style={{ position: 'absolute', right: 0, top: 0, border: 'none' }} onClick={onRemove}> 🗑️
      </Button>
      <Space direction="column">
        <Titled title='　状态'>
          <Select {...ITR_KIND_SELECT_PROPS} value={value.kind} on_changed={v => onChange?.({ ...value, kind: v })} />
        </Titled>
        <Titled title='　效果'>
          <Combine>
            <Select {...ITR_EFFECT_SELECT_PROPS} value={value.effect} on_changed={v => onChange?.({ ...value, effect: v })} />
            <Button onClick={() => onChange?.({ ...value, effect: void 0 })}>❎</Button>
          </Combine>
        </Titled>
        <Titled title='　　盒'>
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
