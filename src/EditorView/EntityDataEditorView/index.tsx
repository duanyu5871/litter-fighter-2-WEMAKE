import Frame, { IFrameProps } from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { ENTITY_TYPE_SELECT_PROPS } from "../EntityEditorView";
import { useEditor } from "../FrameEditorView/useEditor";
export interface IEntityDataEditorViewProps extends IFrameProps {
  value?: IEntityData;
  on_changed?(): void;
}
export function EntityDataEditorView(props: IEntityDataEditorViewProps) {
  const { value, on_changed, ..._p } = props;
  const data = value;
  const Editor1 = useEditor(data!, { width: 80 })
  const Editor2 = useEditor(data?.base!, { width: 80 })
  if (!data) return;
  return (
    <Frame {..._p} label="实体数据">
      <Space direction='column' stretchs>
        <Editor1.EditorStr field="id" />
        <Editor1.EditorSel {...ENTITY_TYPE_SELECT_PROPS} field='type' clearable={false} foo={data.id} on_changed={on_changed} />
        <Editor2.EditorStr field="name" clearable={false} foo={data.base.name} />
      </Space>
    </Frame>
  )
}