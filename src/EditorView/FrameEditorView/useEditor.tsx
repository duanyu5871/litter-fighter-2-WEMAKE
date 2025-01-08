import { useMemo } from "react";
import Combine from "../../Component/Combine";
import { InputNumberProps, InputNumber, InputProps, Input } from "../../Component/Input";
import { TextArea } from "../../Component/TextArea";
import Titled from "../../Component/Titled";

export function useEditor<O extends {}>(value: O) {
  const label_style: React.CSSProperties = { width: 50, textAlign: 'right' };
  const titled_style: React.CSSProperties = { display: 'flex' };
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
      }
    };
  }, [value]);
}
