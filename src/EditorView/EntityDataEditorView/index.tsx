import { useEffect, useMemo, useState } from "react";
import Frame, { IFrameProps } from "../../Component/Frame";
import { Input } from "../../Component/Input";
import Select from "../../Component/Select";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";
import { IEntityData } from "../../LF2/defines/IEntityData";
import { traversal } from "../../LF2/utils/container_help/traversal";
import { ENTITY_TYPE_SELECT_PROPS } from "../EntityEditorView";
import { PicInfoEditorView } from "./FileEditorView";
export interface IEntityDataEditorViewProps extends IFrameProps {
  src?: IEntityData;
  on_change?(data: IEntityData): void;
}


export function EntityDataEditorView(props: IEntityDataEditorViewProps) {
  const { src, on_change, ..._p } = props;

  const data = src;
  const set_data = on_change || (() => void 0);

  if (!data) return;
  const label_style: React.CSSProperties = { width: 30, textAlign: 'right' }
  return (
    <Frame {..._p} label="实体数据">
      <Space direction='column'>
        <Titled label='type' label_style={label_style}>
          <Select
            {...ENTITY_TYPE_SELECT_PROPS}
            defaultValue={data.type}
            on_changed={type => data.base.type = Number(type)} />
        </Titled>
        <Titled label='id' label_style={label_style}>
          <Input
            defaultValue={data.id}
            onChange={e => data.id = e.target.value} />
        </Titled>
        <Titled label='name' label_style={label_style}>
          <Input
            defaultValue={data.base.name}
            onChange={e => data.base.name = e.target.value} />
        </Titled>
      </Space>
    </Frame>
  )
}