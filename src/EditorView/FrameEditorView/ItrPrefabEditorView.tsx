import Frame from "../../Component/Frame";
import { Cross } from "../../Component/Icons/Cross";
import { Space } from "../../Component/Space";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { IItrPrefab } from "../../LF2/defines/IItrPrefab";
import { loop_arr } from "../../LF2/utils/array/loop_arr";
import { traversal } from "../../LF2/utils/container_help/traversal";
import { ITR_EFFECT_SELECT_PROPS, ITR_KIND_SELECT_PROPS } from "../EntityEditorView";
import { useEditor } from "./useEditor";
export interface IItrPrefabEditorViewProps {
  label: string;
  data: IEntityData;
  value: IItrPrefab;
  on_changed?(): void;
}
export function ItrPrefabEditorView(props: IItrPrefabEditorViewProps) {
  const { value, label, data, on_changed } = props;

  const on_remove = () => {
    if (!data.itr_prefabs) return;
    delete data.itr_prefabs[value.id];
    on_changed?.();
  }
  const on_input_id_blur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    if (!data.itr_prefabs) return;
    const prev_id = value.id;
    const next_id = e.target.value.trim();
    if (prev_id === next_id || !next_id) {
      e.target.value = prev_id;
      return;
    }
    if (next_id in data.itr_prefabs) {
      alert('ID不可重复')
      e.target.value = value.id;
      return;
    }
    delete data.itr_prefabs[prev_id];
    value.id = next_id;
    data.itr_prefabs[next_id] = value;
    traversal(data.frames, (_, { itr }) => loop_arr(itr, (itr) => {
      if (!itr) return;
      if (itr.prefab_id?.trim() === prev_id) {
        itr.prefab_id = next_id;
      }
    }))
  }

  const {
    EditorInt, EditorTxt, EditorStr, EditorVec3, EditorQube, EditorSel
  } = useEditor(value)

  return (
    <Frame label={label}>
      <Cross style={{ position: 'absolute', right: 0, top: 0, border: 'none' }} onClick={on_remove} hoverable />
      <Space direction="column" >
        <EditorStr field="id" onBlur={on_input_id_blur} />
        <EditorStr field="name" />
        <EditorSel field="kind" {...ITR_KIND_SELECT_PROPS} />
        <EditorSel field="effect" {...ITR_EFFECT_SELECT_PROPS} />
        <EditorInt field="injury" />
        <EditorInt field="arest" />
        <EditorInt field="vrest" />
        <EditorInt field="motionless" />
        <EditorInt field="shaking" />
        <EditorInt field="fall" />
        <EditorInt field="bdefend" />
        <EditorTxt field="test" />
        <EditorVec3 name="velocity" fields={['dvx', 'dvy', 'dvz']} />
        <EditorQube name="bounding" fields={['x', 'y', 'z', 'w', 'h', 'l']} />
      </Space>
    </Frame>
  );
}
