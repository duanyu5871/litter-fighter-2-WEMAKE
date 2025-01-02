import { useEffect, useMemo, useRef, useState } from "react";
import { ISelectProps } from "../../Component/Select";
import { Space } from "../../Component/Space";
import { Defines, IFrameInfo } from "../../LF2/defines";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { SpeedMode } from "../../LF2/defines/SpeedMode";
import { FrameEditorView } from "../FrameEditorView";
import './style.scss';
const make_num_enum_select_props = (t: any): ISelectProps<string, number> => ({
  items: Object.keys(t).filter(key => {
    if (key.startsWith('_')) return false;
    if (!Number.isNaN(Number(key))) return false;
    return true;
  }),
  option: (k: string) => {
    const value = (t as any)[k];
    const label = `${k}(${value})`;
    return [value, label]
  }
})
export const STATE_SELECT_PROPS = make_num_enum_select_props(Defines.State);
export const SPEED_MODE_SELECT_PROPS = make_num_enum_select_props(SpeedMode);

export interface IEntityEditorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  src: IEntityData;
  on_click_frame?(frame: IFrameInfo, data: IEntityData): void
}
export function EntityEditorView(props: IEntityEditorViewProps) {
  const { src, on_click_frame, ..._p } = props;
  const [data, set_data] = useState(() => ({ ...src }));
  useEffect(() => {
    set_data(src)
  }, [src]);
  const ref_on_click_frame = useRef(on_click_frame);
  ref_on_click_frame.current = on_click_frame;

  const frame_views = useMemo(() => {
    const ret: React.ReactNode[] = [];
    const { frames } = data;
    for (const key in frames) {
      const frame = frames[key];
      ret.push(
        <FrameEditorView
          key={frame.id}
          src={frame}
          data={data}
          onClick={() => ref_on_click_frame.current?.(frame, data)} />
      );
    }
    return ret;
  }, [data]);
  return (
    <Space
      className="entity_editor_view"
      direction="column"
      {..._p}>
      {frame_views}
    </Space>
  );
}
