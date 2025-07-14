import { Button } from "../../Component/Buttons/Button";
import Frame from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { IItrInfo } from "../../LF2/defines";
import { ITR_EFFECT_SELECT_PROPS, ITR_KIND_SELECT_PROPS } from "../EntityEditorView";
import { useEditor } from "./useEditor";
export interface IItrEditorViewProps {
  label: string;
  value: IItrInfo;
  onChange?(value: IItrInfo): void;
  onRemove?(): void;
}
export function ItrEditorView(props: IItrEditorViewProps) {
  const { value, onRemove, onChange, label } = props;
  const { Select, Qube, Text } = useEditor(value);
  return (
    <Frame tabIndex={-1} label={label}>
      <Button style={{ position: 'absolute', right: 0, top: 0, border: 'none' }} onClick={onRemove}>
        🗑️
      </Button>
      <Space vertical stretchs>
        <Select title='状态' field='kind' {...ITR_KIND_SELECT_PROPS} />
        <Select title='效果' field='effect' {...ITR_EFFECT_SELECT_PROPS} />
        <Text title='碰撞测试' field='test' />
        <Qube title='包围盒' fields={['x', 'y', 'z', 'w', 'h', 'l']} />
      </Space>
    </Frame>
  );
}
