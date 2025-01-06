import { useEffect, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame, { IFrameProps } from "../../Component/Frame";
import { Input } from "../../Component/Input";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";
import { IEntityPictureInfo } from "../../LF2/defines/IEntityPictureInfo";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { traversal } from "../../LF2/utils/container_help/traversal";
export interface IFileEditorViewProps extends IFrameProps {
  data: IEntityData;
  pic_info: IEntityPictureInfo;
  on_changed?(): void;
}
export function FileEditorView(props: IFileEditorViewProps) {
  const { data, pic_info, on_changed, ..._p } = props;
  const label_style: React.CSSProperties = { width: 50, textAlign: 'right' };

  const [, set_change_flags] = useState(0);
  const on_input_id_blur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const prev_id = pic_info.id;
    const next_id = e.target.value.trim();
    if (prev_id === next_id || !next_id) {
      e.target.value = prev_id;
      return;
    }
    if (next_id in data.base.files) {
      alert('ID不可重复')
      e.target.value = pic_info.id;
      return;
    }
    delete data.base.files[prev_id];
    pic_info.id = next_id;
    data.base.files[next_id] = pic_info;
    traversal(data.frames, (_, { pic }) => {
      if (!pic) return;
      if (pic.tex.trim() === prev_id) {
        pic.tex = next_id;
      }
    })
  }
  const on_click_remove = () => {
    let used = false;
    for (const k in data.frames) {
      if (data.frames[k].pic?.tex.trim() === pic_info.id) {
        used = true
        break;
      }
    }
    if (used) {
      alert('正在被使用，不能删除!')
      return;
    }
    delete data.base.files[pic_info.id]
    on_changed?.();
  }

  return (
    <Frame {..._p}>
      <svg
        style={{ position: 'absolute', top: 2, right: 2 }}
        width={12}
        height={12}
        viewBox="0, 0, 12, 12"
        onClick={on_click_remove}>
        <path d="M 2 2 L 10 10" stroke="currentColor" fill="none" strokeWidth={2} />
        <path d="M 2 10 L 10 2" stroke="currentColor" fill="none" strokeWidth={2} />
      </svg>
      <Space vertical style={{ padding: '5px 0px' }}>
        <Titled label='id' label_style={label_style}>
          <Input defaultValue={pic_info.id} onBlur={on_input_id_blur} />
        </Titled>
        <Titled label='file' label_style={label_style}>
          <Input
            defaultValue={pic_info.path}
            onChange={e => pic_info.path = e.target.value} />
        </Titled>
        <Titled label='variants' label_style={label_style} >
          <Combine direction='column' >
            {pic_info.variants?.map((value, idx) => {
              return (
                <Combine style={{ width: 100 }}>
                  <Input
                    defaultValue={value}
                    onBlur={e => {
                      if (pic_info.variants) pic_info.variants[idx] = e.target.value.trim();
                      set_change_flags(v => v + 1)
                    }} />
                  <Button onClick={() => {
                    pic_info.variants?.splice(idx, 1);
                    set_change_flags(v => v + 1)
                  }}>
                    🗑️
                  </Button>
                </Combine>
              );
            })}
            <Button onClick={() => {
              pic_info.variants = pic_info.variants || [];
              pic_info.variants.push('');
              set_change_flags(v => v + 1)
            }}>
              ➕
            </Button>
          </Combine>
        </Titled>
      </Space>
    </Frame>
  );
}
