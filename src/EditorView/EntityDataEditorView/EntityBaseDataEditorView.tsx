
import Frame, { IFrameProps } from "../../Component/Frame";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import { Defines } from "../../LF2/defines";
import { EntityEnum } from "../../LF2/defines/EntityEnum";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { useEditor } from "../FrameEditorView/useEditor";

export interface IEntityBaseDataEditorViewProps extends IFrameProps {
  value?: IEntityData;
  on_changed?(): void;
}

export function EntityBaseDataEditorView(props: IEntityBaseDataEditorViewProps) {
  const { value, on_changed, ..._p } = props;
  const data = value;
  const Editor = useEditor((data?.base)!, { width: 80 });
  if (!data) return;
  return (
    <Frame {..._p}>
      <Show show={data.type === EntityEnum.Character}>
        <Space direction='column'>
          <Editor.EditorInt field="ce" clearable={false} foo={data.base.ce} placeholder={'1'} />
          <Editor.EditorImg field="head" clearable={false} foo={data.base.head} />
          <Editor.EditorImg field="small" clearable={false} foo={data.base.small} />
          <Editor.EditorInt field="fall_value" foo={data.base.fall_value} placeholder={'' + Defines.DEFAULT_FALL_VALUE_MAX} />
          <Editor.EditorInt field="defend_value" foo={data.base.defend_value} placeholder={'' + Defines.DEFAULT_DEFEND_VALUE_MAX} />
          <Editor.EditorInt field="resting" foo={data.base.resting} placeholder={'' + Defines.DEFAULT_RESTING_MAX} />
          <Editor.EditorInt field="hp" foo={data.base.hp} placeholder={'' + Defines.DEFAULT_HP} />
          <Editor.EditorInt field="mp" foo={data.base.mp} placeholder={'' + Defines.DEFAULT_MP} />
          <Editor.EditorFlt field="mp_r_max_spd" foo={data.base.mp_r_max_spd} placeholder={'' + Defines.DEFAULT_MP_RECOVERY_MAX_SPEED} />
          <Editor.EditorFlt field="mp_r_min_spd" foo={data.base.mp_r_min_spd} placeholder={'' + Defines.DEFAULT_MP_RECOVERY_MIN_SPEED} />
          <Editor.EditorInt field="catch_time" foo={data.base.catch_time} placeholder={'' + Defines.DEFAULT_CATCH_TIME} />
          <Editor.EditorInt field="jump_height" foo={data.base.jump_height} />
          <Editor.EditorInt field="jump_distance" foo={data.base.jump_distance} />
          <Editor.EditorInt field="jump_distancez" foo={data.base.jump_distancez} />
          <Editor.EditorFlt field="dash_height" foo={data.base.dash_height} />
          <Editor.EditorFlt field="dash_distance" foo={data.base.dash_distance} />
          <Editor.EditorInt field="dash_distancez" foo={data.base.dash_distancez} />
          <Editor.EditorInt field="rowing_height" foo={data.base.rowing_height} />
          <Editor.EditorInt field="rowing_distance" foo={data.base.rowing_distance} />
        </Space>
      </Show>
    </Frame>
  );
}
