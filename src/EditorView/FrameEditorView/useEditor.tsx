import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import { Plus } from '../../Component/Icons/Plus';
import { Cross } from '../../Component/Icons/Cross';
import { Input, InputNumber, InputNumberProps, InputProps } from "../../Component/Input";
import { TextArea } from "../../Component/TextArea";
import Titled, { ITitledProps } from "../../Component/Titled";
import Select, { ISelectProps } from "../../Component/Select";
import { IZipObject } from "../../LF2/ditto";
import { shared_ctx } from "../Context";
import { Space } from "../../Component/Space";


export function useEditor<O extends {}>(value: O, _label_style: React.CSSProperties = { width: 50, textAlign: 'right' }) {
  const label_style: React.CSSProperties = useMemo(() => (
    { width: 50, textAlign: 'right', ..._label_style }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), []);
  const titled_style: React.CSSProperties = useMemo(() => (
    { display: 'flex' }
  ), []);
  return useMemo(() => {
    const t_props = (field: any) => ({
      float_label: field.toString(),
      label_style: label_style,
      style: titled_style,
    });
    type Field = keyof typeof value;
    type Props = { field: Field; foo?: any }
    type Props2 = { fields: [Field, Field]; foo?: any }
    return {
      EditorImg(props: Props & Partial<ISelectProps<IZipObject, string>>) {
        const { field, ..._p } = props;
        const { zip } = useContext(shared_ctx);
        const [img_list, set_img_list] = useState<IZipObject[]>([])
        useEffect(() => {
          if (zip) set_img_list(zip.file(/.png$/))
        }, [zip])
        return (
          <Titled {...t_props(field)}>
            <Select
              items={img_list}
              parse={v => [v.name, v.name]}
              defaultValue={(value as any)[field]}
              on_changed={v => (value as any)[field] = v}
              clearable
              style={{ flex: 1 }}
              {..._p} />
          </Titled>
        );
      },
      EditorFlt(props: Props & InputNumberProps) {
        const { field, ..._p } = props;
        return (
          <Titled {...t_props(field)}>
            <InputNumber
              defaultValue={(value as any)[field]}
              on_blur={v => (value as any)[field] = v}
              style={{ flex: 1 }}
              step={0.01}
              clearable
              {..._p} />
          </Titled>
        );
      },
      EditorInt(props: Props & InputNumberProps) {
        const { field, ..._p } = props;
        return (
          <Titled {...t_props(field)}>
            <InputNumber
              defaultValue={(value as any)[field]}
              on_blur={v => (value as any)[field] = v}
              style={{ flex: 1 }}
              step={1}
              clearable
              {..._p} />
          </Titled>
        );
      },
      EditorTxt(props: Props) {
        const { field } = props;
        return (
          <Titled {...t_props(field)}>
            <TextArea
              style={{ flex: 1, resize: 'vertical' }}
              defaultValue={(value as any)[field]}
              onBlur={e => (value as any)[field] = e.target.value.trim() || void 0} />
          </Titled>
        );
      },
      EditorStr(props: Props & InputProps) {
        const { field, ..._p } = props;
        return (
          <Titled {...t_props(field)}>
            <Input
              style={{ flex: 1 }}
              defaultValue={(value as any)[field]}
              onBlur={e => (value as any)[field] = e.target.value.trim() || void 0}
              {..._p} />
          </Titled>
        );
      },
      EditorVec3(props: { name: string; fields: [Field, Field, Field]; clearable?: boolean } & ITitledProps) {
        const { name, fields: [x, y, z], clearable, ..._p } = props;
        const combine_style: React.CSSProperties = { flex: 1 }
        const input_style: React.CSSProperties = { flex: 1 }
        return (
          <Titled {...t_props(name)} {..._p}>
            <Combine style={combine_style}>
              <InputNumber
                defaultValue={(value as any)[x]}
                on_change={v => (value as any)[x] = v}
                title="x"
                prefix="x"
                style={input_style}
                clearable={clearable} />
              <InputNumber
                defaultValue={(value as any)[y]}
                on_change={v => (value as any)[y] = v}
                title="y"
                prefix="y"
                style={input_style}
                clearable={clearable} />
              <InputNumber
                defaultValue={(value as any)[z]}
                on_change={v => (value as any)[z] = v}
                title="z"
                prefix="z"
                style={input_style}
                clearable={clearable} />
            </Combine>
          </Titled>
        );
      },
      EditorVec2(props: { name: string; fields: [Field, Field]; clearable?: boolean } & ITitledProps) {
        const { name, fields: [x, y], clearable, ..._p } = props;
        const combine_style: React.CSSProperties = { flex: 1 }
        const input_style: React.CSSProperties = { flex: 1 }
        return (
          <Titled {...t_props(name)} {..._p}>
            <Combine style={combine_style}>
              <InputNumber
                defaultValue={(value as any)[x]}
                on_change={v => (value as any)[x] = v}
                title="x"
                prefix="x"
                style={input_style}
                clearable={clearable} />
              <InputNumber
                defaultValue={(value as any)[y]}
                on_change={v => (value as any)[y] = v}
                title="y"
                prefix="y"
                style={input_style}
                clearable={clearable} />
            </Combine>
          </Titled>
        );
      },
      EditorQube(props: { name: string; fields: [Field, Field, Field, Field, Field, Field]; clearable?: boolean } & ITitledProps) {
        const { name, fields: [x, y, z, w, h, l], clearable, ..._p } = props;
        const combine_style: React.CSSProperties = { flex: 1, alignItems: 'stretch' }
        const input_style: React.CSSProperties = { flex: 1 }
        return (
          <Titled {...t_props(name)} {..._p}>
            <Combine direction="column" style={combine_style}>
              <Combine>
                <InputNumber
                  defaultValue={(value as any)[x]}
                  on_change={v => (value as any)[x] = v}
                  title="x" prefix="x"
                  style={input_style}
                  clearable={clearable} />
                <InputNumber
                  defaultValue={(value as any)[y]}
                  on_change={v => (value as any)[y] = v}
                  title="y" prefix="y"
                  style={input_style}
                  clearable={clearable} />
                <InputNumber
                  defaultValue={(value as any)[z]}
                  on_change={v => (value as any)[z] = v}
                  title="z" prefix="z"
                  style={input_style}
                  clearable={clearable} />
              </Combine>
              <Combine>
                <InputNumber
                  defaultValue={(value as any)[w]}
                  on_change={v => (value as any)[w] = v}
                  title="w" prefix="w"
                  style={input_style}
                  clearable={clearable} />
                <InputNumber
                  defaultValue={(value as any)[h]}
                  on_change={v => (value as any)[h] = v}
                  title="h" prefix="h"
                  style={input_style}
                  clearable={clearable} />
                <InputNumber
                  defaultValue={(value as any)[l]}
                  on_change={v => (value as any)[l] = v}
                  title="l" prefix="l"
                  style={input_style}
                  clearable={clearable} />
              </Combine>
            </Combine>
          </Titled>
        );
      },
      EditorStrList(props: Props) {
        const { field, } = props;
        const list: string[] | undefined = (value as any)[field];
        const [, set_change_flags] = useState(0);

        const on_click_add = () => {
          (value as any)[field] = (value as any)[field] || [];
          (value as any)[field].push('');
          set_change_flags(v => v + 1)
        }
        const on_click_del = (idx: number) => {
          list?.splice(idx, 1);
          set_change_flags(v => v + 1)
        }
        const on_blur = (idx: number, str: string) => {
          (value as any)[field][idx] = str.trim();
          set_change_flags(v => v + 1)
        }
        return (
          <Titled {...t_props(field)}>
            <Combine direction='column' style={{ flex: 1 }}>
              {list?.map((value, idx) => {
                return (
                  <Combine key={idx}>
                    <Input
                      style={{ flex: 1 }}
                      defaultValue={value}
                      onBlur={e => on_blur(idx, e.target.value)} />
                    <Button >
                      <Cross onClick={() => on_click_del(idx)} />
                    </Button>
                  </Combine>
                );
              })}
              <Button onClick={on_click_add}>
                <Plus />
              </Button>
            </Combine>
          </Titled>
        );
      },
      EditorIntList(props: Props) {
        const { field, } = props;
        const list: number[] | undefined = (value as any)[field];
        const [, set_change_flags] = useState(0);
        const on_click_add = () => {
          (value as any)[field] = (value as any)[field] || [];
          (value as any)[field].push(void 0);
          set_change_flags(v => v + 1);
        }
        const on_click_del = (idx: number) => {
          list?.splice(idx, 1);
          set_change_flags(v => v + 1);
        }
        const on_blur = (idx: number, num: number | undefined) => {
          (value as any)[field][idx] = num;
          set_change_flags(v => v + 1);
        }
        return (
          <Titled {...t_props(field)}>
            <Combine direction='column' style={{ flex: 1 }}>
              {list?.map((value, idx) => {
                return (
                  <Combine>
                    <InputNumber
                      style={{ flex: 1 }}
                      defaultValue={value}
                      on_blur={v => on_blur(idx, v)} />
                    <Button >
                      <Cross onClick={() => on_click_del(idx)} />
                    </Button>
                  </Combine>
                );
              })}
              <Button onClick={on_click_add}>
                <Plus />
              </Button>
            </Combine>
          </Titled>
        );
      },
      EditorSel<T, V>(props: Props & ISelectProps<T, V>) {
        const { field, on_changed, ..._p } = props;
        const [, set_change_flags] = useState(0);
        return (
          <Titled {...t_props(field)}>
            <Select
              defaultValue={(value as any)[field]}
              on_changed={v => {
                (value as any)[field] = v;
                on_changed?.(v);
                set_change_flags(v => ++v);
              }}
              clearable
              style={{ flex: 1 }}
              {..._p} />
          </Titled>
        )
      },
      EditorSel3<T, V>(props: {
        name: string;
        fields: [Field, Field, Field];
        placeholders?: [string, string, string]
        clearable?: boolean;
        select: ISelectProps<T, V>
      } & ITitledProps) {
        const { name, fields: [x, y, z], placeholders, clearable, select, ..._p } = props;
        const combine_style: React.CSSProperties = { flex: 1 }
        const select_style: React.CSSProperties = { flex: 1 }
        return (
          <Titled {...t_props(name)} {..._p}>
            <Combine style={combine_style}>
              <Select
                defaultValue={(value as any)[x]}
                on_changed={v => { (value as any)[x] = v; }}
                placeholder={placeholders?.at(0)}
                clearable
                style={select_style}
                {...select} />
              <Select
                defaultValue={(value as any)[y]}
                on_changed={v => { (value as any)[y] = v; }}
                placeholder={placeholders?.at(1)}
                clearable
                style={select_style}
                {...select} />
              <Select
                defaultValue={(value as any)[z]}
                on_changed={v => { (value as any)[z] = v; }}
                placeholder={placeholders?.at(2)}
                clearable
                style={select_style}
                {...select} />
            </Combine>
          </Titled>
        );
      },
    };
  }, [value, label_style, titled_style]);
}
