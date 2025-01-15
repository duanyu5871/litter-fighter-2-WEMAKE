import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrowDown(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  )
}
const o = Object.assign(ArrowDown, Base)
ArrowDown.path = o.m(o.pad)
  .l(o.w / 2, o.h - o.pad, o.w - o.pad, o.pad)
  .ok()

