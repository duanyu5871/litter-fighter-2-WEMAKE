import { Button } from "../Buttons/Button";
import Combine, { ICombineProps } from "../Combine";

export interface ITabButtonsProps<V extends number | string, I> extends Omit<ICombineProps, 'children' | 'onChange'> {
  value?: V;
  items?: I[];
  parse?(item: I, idx: number, items: I[]): [V, React.ReactNode];
  onChange?(value: V | undefined, e: React.MouseEvent): void;
  disabled?: boolean;
}
export function TabButtons<V extends number | string, I>(props: ITabButtonsProps<V, I>) {
  const { value, items, parse, onChange, disabled, ..._p } = props;

  return (
    <Combine {..._p} >
      {
        items?.map((item, idx, items) => {
          const [v, label] = parse?.(item, idx, items) || []
          return (
            <Button
              key={idx}
              onClick={(e) => v === value ? void 0 : onChange?.(v, e)}
              actived={v === value}
              disabled={disabled}>
              {label}
            </Button>
          )
        })
      }
    </Combine>
  )
}