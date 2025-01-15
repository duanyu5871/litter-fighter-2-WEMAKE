import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrowDown3(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  return (
    <Base viewBox={o.size} {..._p}>
      <path className={Base.styles.text_stroke} d={o.path} />
    </Base>
  )
}
const o = ArrowDown3
ArrowDown3.pad = 1
ArrowDown3.w = 12;
ArrowDown3.h = 12;
ArrowDown3.size = `0, 0, ${o.w}, ${o.h}`
ArrowDown3.path =
  `M ${o.pad} ${o.pad} ` +
  `L ${o.w / 2} ${o.h - o.pad} ` +
  `L ${o.w - o.pad} ${o.pad}`

  