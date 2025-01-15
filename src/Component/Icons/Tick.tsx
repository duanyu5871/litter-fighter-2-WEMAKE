import { Base, IIconProps } from "./Base";

export function Tick(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  );
}
const o = Object.assign(Tick, Base)
Tick.path = o
  .m(1, 6.5)
  .l(4, 9.5)
  .l(10, 3.5)
  .ok()