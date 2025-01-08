import { useEffect, useMemo, useRef, useState } from "react";
import { IBaseSelectProps } from "../../Component/Select";
import { Space } from "../../Component/Space";
import { Defines, IFrameInfo, INextFrame, ItrEffect, ItrKind } from "../../LF2/defines";
import { BdyKind } from "../../LF2/defines/BdyKind";
import { EntityEnum } from "../../LF2/defines/EntityEnum";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { SpeedMode } from "../../LF2/defines/SpeedMode";
import { FrameEditorView } from "../FrameEditorView";
import './style.scss';
import classNames from "classnames";
const make_num_enum_select_props = (t: any): IBaseSelectProps<string, number> => ({
  items: Object.keys(t).filter(key => {
    if (key.startsWith('_')) return false;
    if (!Number.isNaN(Number(key))) return false;
    return true;
  }),
  parse: (k: string) => {
    const value = (t as any)[k];
    const label = `${k}(${value})`;
    return [value, label]
  }
})
const make_str_enum_select_props = (t: any): IBaseSelectProps<string, string> => ({
  items: Object.keys(t).filter(key => {
    if (key.startsWith('_')) return false;
    return true;
  }),
  parse: (k: string) => {
    const value = (t as any)[k];
    const label = `${k}(${value})`;
    return [value, label]
  }
})
export const STATE_SELECT_PROPS = make_num_enum_select_props(Defines.State);
export const SPEED_MODE_SELECT_PROPS = make_num_enum_select_props(SpeedMode);
export const ITR_KIND_SELECT_PROPS = make_num_enum_select_props(ItrKind);
export const ITR_EFFECT_SELECT_PROPS = make_num_enum_select_props(ItrEffect);
export const BDY_KIND_SELECT_PROPS = make_num_enum_select_props(BdyKind);
export const ENTITY_TYPE_SELECT_PROPS = make_str_enum_select_props(EntityEnum);
export interface IEntityEditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  src: IEntityData;
  on_click_frame?(frame: IFrameInfo, data: IEntityData): void
  on_frame_change?(frame: IFrameInfo, data: IEntityData): void
  on_click_goto_next_frame?(next_frame: INextFrame, data: IEntityData): void;
}

export function EntityEditorView(props: IEntityEditorViewProps) {
  const { src, on_click_frame, on_frame_change, on_click_goto_next_frame, className, ..._p } = props;
  const [data, set_data] = useState(() => ({ ...src }));
  useEffect(() => {
    set_data(src)
  }, [src]);
  const ref_on_click_frame = useRef(on_click_frame);
  ref_on_click_frame.current = on_click_frame;
  const ref_on_frame_change = useRef(on_frame_change);
  ref_on_frame_change.current = on_frame_change;
  const ref_on_click_goto_next_frame = useRef(on_click_goto_next_frame);
  ref_on_click_goto_next_frame.current = on_click_goto_next_frame;

  const frame_views = useMemo(() => {
    const ret: React.ReactNode[] = [];
    const { frames } = data;
    for (const key in frames) {
      const frame = frames[key];
      ret.push(
        <FrameEditorView
          key={frame.id}
          value={frame}
          data={data}
          on_frame_change={(...a) => ref_on_frame_change.current?.(...a)}
          on_click_frame={(...a) => ref_on_click_frame.current?.(...a)}
          on_click_goto_next_frame={(...a) => ref_on_click_goto_next_frame.current?.(...a)} />
      );
    }
    return ret;
  }, [data]);
  return (
    <Space className={classNames("entity_editor_view", className)} direction="column" {..._p}>
      {frame_views}
    </Space>
  );
}
