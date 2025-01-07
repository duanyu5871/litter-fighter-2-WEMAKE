import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame from "../../Component/Frame";
import { Input, InputNumber } from "../../Component/Input";
import Select from "../../Component/Select";
import { Space } from "../../Component/Space";
import { TextArea } from "../../Component/TextArea";
import Titled from "../../Component/Titled";
import { IItrInfo } from "../../LF2/defines";
import { ITR_EFFECT_SELECT_PROPS, ITR_KIND_SELECT_PROPS } from "../EntityEditorView";
export interface IItrEditorViewProps {
  label: string;
  value: Partial<IItrInfo>;
  onRemove?(): void;
}

export function ItrEditorView(props: IItrEditorViewProps) {
  const { value: itr, onRemove, label } = props;
  return (
    <Frame tabIndex={-1} label={label}>
      <Button style={{ position: 'absolute', right: 0, top: 0, border: 'none' }} onClick={onRemove}>
        🗑️
      </Button>
      <Space direction="column">
        <Titled label='　　状态'>
          <Select {...ITR_KIND_SELECT_PROPS} value={itr.kind} on_changed={v => itr.kind = v} />
        </Titled>
        <Titled label='　　效果'>
          <Select {...ITR_EFFECT_SELECT_PROPS} value={itr.effect} on_changed={v => itr.effect = v} />
        </Titled>
        <Titled label='碰撞测试' style={{ display: 'flex' }}>
          <TextArea style={{ flex: 1, resize: 'vertical' }} defaultValue={itr.test} onChange={e => {
            itr.test = e.target.value.trim();
            if (!itr.test) delete itr.test;
          }} />
        </Titled>
        <Titled label='　包围盒'>
          <Combine direction="column">
            <Combine>
              <InputNumber defaultValue={itr.x} on_change={v => itr.x = v} title="x" prefix="x" style={{ width: 80 }} />
              <InputNumber defaultValue={itr.y} on_change={v => itr.y = v} title="y" prefix="y" style={{ width: 80 }} />
              <InputNumber defaultValue={itr.z} on_change={v => itr.z = v} title="z" prefix="z" style={{ width: 80 }} />
            </Combine>
            <Combine>
              <InputNumber defaultValue={itr.w} on_change={v => itr.w = v} title="w" prefix="w" style={{ width: 80 }} />
              <InputNumber defaultValue={itr.h} on_change={v => itr.h = v} title="h" prefix="h" style={{ width: 80 }} />
              <InputNumber defaultValue={itr.l} on_change={v => itr.l = v} title="l" prefix="l" style={{ width: 80 }} />
            </Combine>
          </Combine>
        </Titled>
      </Space>
    </Frame>
  );
}
