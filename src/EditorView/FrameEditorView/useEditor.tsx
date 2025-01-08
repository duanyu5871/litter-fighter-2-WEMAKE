import { useMemo, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import { Add, Close3 } from "../../Component/Icons/Clear";
import { Input, InputNumber, InputNumberProps, InputProps } from "../../Component/Input";
import { TextArea } from "../../Component/TextArea";
import Titled from "../../Component/Titled";
import Select, { ISelectProps } from "../../Component/Select";

const label_style: React.CSSProperties = { width: 50, textAlign: 'right' };
const titled_style: React.CSSProperties = { display: 'flex' };
export function useEditor<O extends {}>(value: O) {
  return useMemo(() => {
    const t_props = (field: any) => ({
      label: field.toString(),
      label_style: label_style,
      style: titled_style,
    });
    type Field = keyof typeof value;
    return {
      EditorInt(props: { field: Field; } & InputNumberProps) {
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
      EditorTxt(props: { field: Field; }) {
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
      EditorStr(props: { field: Field; } & InputProps) {
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
      EditorVec3(props: { name: string; fields: [Field, Field, Field]; }) {
        const { name, fields: [x, y, z] } = props;
        return (
          <Titled {...t_props(name)}>
            <Combine>
              <InputNumber defaultValue={(value as any)[x]} on_change={v => (value as any)[x] = v} title="x" prefix="x" style={{ width: 80 }} clearable />
              <InputNumber defaultValue={(value as any)[y]} on_change={v => (value as any)[y] = v} title="y" prefix="y" style={{ width: 80 }} clearable />
              <InputNumber defaultValue={(value as any)[z]} on_change={v => (value as any)[z] = v} title="z" prefix="z" style={{ width: 80 }} clearable />
            </Combine>
          </Titled>
        );
      },
      EditorQube(props: { name: string; fields: [Field, Field, Field, Field, Field, Field]; }) {
        const { name, fields: [x, y, z, w, h, l] } = props;
        return (
          <Titled {...t_props(name)}>
            <Combine direction="column">
              <Combine>
                <InputNumber defaultValue={(value as any)[x]} on_change={v => (value as any)[x] = v} title="x" prefix="x" style={{ width: 80 }} clearable />
                <InputNumber defaultValue={(value as any)[y]} on_change={v => (value as any)[y] = v} title="y" prefix="y" style={{ width: 80 }} clearable />
                <InputNumber defaultValue={(value as any)[z]} on_change={v => (value as any)[z] = v} title="z" prefix="z" style={{ width: 80 }} clearable />
              </Combine>
              <Combine>
                <InputNumber defaultValue={(value as any)[w]} on_change={v => (value as any)[w] = v} title="w" prefix="w" style={{ width: 80 }} clearable />
                <InputNumber defaultValue={(value as any)[h]} on_change={v => (value as any)[h] = v} title="h" prefix="h" style={{ width: 80 }} clearable />
                <InputNumber defaultValue={(value as any)[l]} on_change={v => (value as any)[l] = v} title="l" prefix="l" style={{ width: 80 }} clearable />
              </Combine>
            </Combine>
          </Titled>
        );
      },
      EditorStrList(props: { field: Field; }) {
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
                  <Combine>
                    <Input
                      style={{ flex: 1 }}
                      defaultValue={value}
                      onBlur={e => on_blur(idx, e.target.value)} />
                    <Button >
                      <Close3 onClick={() => on_click_del(idx)} />
                    </Button>
                  </Combine>
                );
              })}
              <Button onClick={on_click_add}>
                <Add />
              </Button>
            </Combine>
          </Titled>
        );
      },
      EditorIntList(props: { field: Field; }) {
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
                      <Close3 onClick={() => on_click_del(idx)} />
                    </Button>
                  </Combine>
                );
              })}
              <Button onClick={on_click_add}>
                <Add />
              </Button>
            </Combine>
          </Titled>
        );
      },
      EditorSel<T, V>(props: { field: Field; } & ISelectProps<T, V>) {
        const { field, ..._p } = props;
        return (
          <Titled {...t_props(field)}>
            <Select
              defaultValue={(value as any)[field]}
              on_changed={v => {
                alert('' + v);
                (value as any)[field] = v
              }}
              clearable
              style={{ flex: 1 }}
              {..._p} />
          </Titled>
        )
      }
    };
  }, [value]);
}
