import { useState, useEffect, useMemo } from "react";
import Frame, { IFrameProps } from "../../Component/Frame";
import { Input } from "../../Component/Input";
import Select from "../../Component/Select";
import Titled from "../../Component/Titled";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { ENTITY_TYPE_SELECT_PROPS } from "../EntityEditorView";
import { traversal } from "../../LF2/utils/container_help/traversal";
import { IEntityPictureInfo } from "../../LF2/defines/IEntityPictureInfo";
import { Space } from "../../Component/Space";
import Combine from "../../Component/Combine";
import { Button } from "../../Component/Buttons/Button";
export interface IEntityDataEditorViewProps extends IFrameProps {
  src?: IEntityData;
}
export interface IFileEditorViewProps extends IFrameProps {
  src?: IEntityPictureInfo
}
export function FileEditorView(props: IFileEditorViewProps) {
  const { src, ..._p } = props;
  const [data, set_data] = useState<IEntityPictureInfo>()
  useEffect(() => {
    if (!src) { set_data(void 0) }
    else set_data(JSON.parse(JSON.stringify(src)))
  }, [src])

  if (!data) return;
  const label_style: React.CSSProperties = { width: 30, textAlign: 'right' }
  return (
    <Frame {..._p} label={'pic_' + data.id}>
      <Space vertical>
        <Titled label='标志' label_style={label_style}>
          <Input value={data.id} onChange={e => set_data({ ...data, id: e.target.value })} />
        </Titled>
        <Titled label='文件' label_style={label_style}>
          <Input value={data.path} onChange={e => set_data({ ...data, path: e.target.value })} />
        </Titled>
        <Titled label='变体' label_style={label_style}>
          <Combine direction='column'>
            {
              data.variants?.map((value, idx) => {
                return (
                  <Combine style={{ width: 100 }} >
                    <Input
                      value={value}
                      onChange={e => {
                        const [...variants] = data.variants || []
                        variants[idx] = e.target.value;
                        set_data({ ...data, variants: variants })
                      }} />
                    <Button onClick={e => {
                      const [...variants] = data.variants || []
                      variants.splice(idx, 1)
                      set_data({ ...data, variants: variants })
                    }}>
                      🚮
                    </Button>
                  </Combine>
                )
              })
            }
            <Button onClick={() => set_data({ ...data, variants: data.variants ? [...data.variants, ''] : [''] })}>
              ➕
            </Button>
          </Combine>
        </Titled>
      </Space>
    </Frame>
  )
}

export function EntityDataEditorView(props: IEntityDataEditorViewProps) {
  const { src, ..._p } = props;
  const [data, set_data] = useState<IEntityData>()
  useEffect(() => {
    if (!src) { set_data(void 0) }
    else set_data(JSON.parse(JSON.stringify(src)))
  }, [src])

  const files = data?.base.files
  const file_editor_views = useMemo(() => {
    if (!files) return [];
    const ret: React.ReactNode[] = []
    traversal(files, (key, v) => {
      ret.push(
        <FileEditorView src={v} key={'FileEditorView_' + key} />
      )
    })
    return ret;
  }, [files])

  if (!data) return;
  const label_style: React.CSSProperties = { width: 30, textAlign: 'right' }
  return (
    <Frame {..._p} label="实体数据">
      <Space direction='column'>
        <Titled label='type' label_style={label_style}>
          <Select
            {...ENTITY_TYPE_SELECT_PROPS}
            value={data.type}
            on_changed={type => set_data({ ...data, type: type as any })} />
        </Titled>
        <Titled label='id' label_style={label_style}>
          <Input value={data.id} onChange={e => set_data({ ...data, id: e.target.value })} />
        </Titled>
        <Titled label='name' label_style={label_style}>
          <Input
            value={data.base.name}
            onChange={e => set_data({ ...data, base: { ...data.base, name: e.target.value } })} />
        </Titled>
      </Space>
    </Frame>
  )
}