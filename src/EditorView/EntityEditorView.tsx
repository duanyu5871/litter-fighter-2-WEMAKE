import { useContext, useEffect, useMemo, useState } from "react";
import { ISelectProps } from "../Component/Select";
import { Defines } from "../LF2/defines";
import { IEntityData } from "../LF2/defines/IEntityData";
import { SpeedMode } from "../LF2/defines/SpeedMode";
import { draw_job_list, EntityFrameEditorView } from "./FrameEditorView";
import { shared_ctx } from "./Context";
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
export function EntityEditorView(props: { data: IEntityData; }) {
  const { data: src } = props;
  const [data, set_data] = useState(() => ({ ...src }));
  useEffect(() => {
    draw_job_list.length = 0
    set_data(src)
  }, [src]);

  const frame_views = useMemo(() => {
    const ret: React.ReactNode[] = [];
    const { frames } = data;
    for (const key in frames) {
      const frame = frames[key];
      ret.push(
        <EntityFrameEditorView frame={frame} key={frame.id} data={data} />
      );
    }
    return ret;
  }, [data]);
  return (
    <div className="lf2_hoverable_border" style={{ flex: 1, padding: 5, overflow: 'auto' }}>
      {frame_views}
    </div>
  );
}
