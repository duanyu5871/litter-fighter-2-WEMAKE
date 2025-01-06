import { useEffect, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import Frame, { IFrameProps } from "../../Component/Frame";
import { Input } from "../../Component/Input";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";
import { IEntityPictureInfo } from "../../LF2/defines/IEntityPictureInfo";
export interface IFileEditorViewProps extends IFrameProps {
  src?: IEntityPictureInfo
}
export function FileEditorView(props: IFileEditorViewProps) {
  const { src, ..._p } = props;
  const [data, set_data] = useState<IEntityPictureInfo>();
  useEffect(() => {
    if (!src) { set_data(void 0); }
    else set_data(JSON.parse(JSON.stringify(src)));
  }, [src]);

  if (!data) return;
  const label_style: React.CSSProperties = { width: 30, textAlign: 'right' };
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
            {data.variants?.map((value, idx) => {
              return (
                <Combine style={{ width: 100 }}>
                  <Input
                    value={value}
                    onChange={e => {
                      const [...variants] = data.variants || [];
                      variants[idx] = e.target.value;
                      set_data({ ...data, variants: variants });
                    }} />
                  <Button onClick={e => {
                    const [...variants] = data.variants || [];
                    variants.splice(idx, 1);
                    set_data({ ...data, variants: variants });
                  }}>
                    🚮
                  </Button>
                </Combine>
              );
            })}
            <Button onClick={() => set_data({ ...data, variants: data.variants ? [...data.variants, ''] : [''] })}>
              ➕
            </Button>
          </Combine>
        </Titled>
      </Space>
    </Frame>
  );
}
