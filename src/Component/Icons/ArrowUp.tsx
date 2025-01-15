import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrowUp(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  )
}
const o = Object.assign(ArrowUp, Base)
ArrowUp.path =
  `M ${o.pad} ${o.h - o.pad} ` +
  `L ${o.w / 2} ${o.pad} ` +
  `L ${o.w - o.pad} ${o.h - o.pad} `
