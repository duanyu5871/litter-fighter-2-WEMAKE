import { useContext, useEffect, useState } from "react";
import Frame, { IFrameProps } from "../Component/Frame";
import { Close2 } from "../Component/Icons/Clear";
import { Space } from "../Component/Space";
import { IEntityData } from "../LF2/defines/IEntityData";
import { IEntityPictureInfo } from "../LF2/defines/IEntityPictureInfo";
import { traversal } from "../LF2/utils/container_help/traversal";
import { shared_ctx } from "./Context";
import { useEditor } from "./FrameEditorView/useEditor";
import { IZipObject } from "../LF2/ditto/zip/IZipObject";
export interface IFileEditorViewProps extends IFrameProps {
  data: IEntityData;
  pic_info: IEntityPictureInfo;
  on_changed?(): void;
}
export function PicInfoEditorView(props: IFileEditorViewProps) {
  const { data, pic_info, on_changed, ..._p } = props;
  const { zip } = useContext(shared_ctx);
  const [img_list, set_png_list] = useState<IZipObject[]>([])

  useEffect(() => {
    if (zip) set_png_list(zip.file(/.png$/))
  }, [zip])

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
    traversal(data.base.files, (_, v) => {
      v.variants?.forEach((v, idx, arr) => {
        if (v.trim() === prev_id) {
          arr[idx] = next_id;
        }
      })
    })
    on_changed?.();
  }
  const on_click_remove = () => {
    for (const k in data.frames) {
      if (data.frames[k].pic?.tex.trim() === pic_info.id) {
        alert('正在被使用，不能删除!')
        return;
      }
    }
    delete data.base.files[pic_info.id]
    on_changed?.();
  }
  const { EditorStr, EditorStrList, EditorSel } = useEditor(pic_info)
  return (
    <Frame {..._p} label='pic'>
      <Close2 style={{ position: 'absolute', top: 0, right: 0 }} onClick={on_click_remove} hoverable />
      <Space vertical>
        <EditorStr field='id' onBlur={on_input_id_blur} />
        <EditorSel field="path" items={img_list} parse={v => [v.name, v.name]} />
        <EditorStrList field="variants" />
      </Space>
    </Frame>
  );
}
