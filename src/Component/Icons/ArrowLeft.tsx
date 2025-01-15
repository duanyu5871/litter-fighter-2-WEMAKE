import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrowLeft(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
    </Base>
  )
}
const o = Object.assign(ArrowLeft, Base)
ArrowLeft.path =
  `M ${o.w - o.pad} ${o.pad} ` +
  `L ${o.pad} ${o.h / 2} ` +
  `L ${o.w - o.pad} ${o.h - o.pad} `

