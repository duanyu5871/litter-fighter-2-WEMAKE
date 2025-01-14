import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrorLeft3(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  return (
    <Base viewBox={o.size} {..._p}>
      <path className={Base.styles.text_stroke} d={o.path} />
    </Base>
  )
}
const o = ArrorLeft3
ArrorLeft3.pad = 1
ArrorLeft3.w = 12;
ArrorLeft3.h = 12;
ArrorLeft3.size = `0, 0, ${o.w}, ${o.h}`
ArrorLeft3.path =
  `M ${o.w - o.pad} ${o.pad} ` +
  `L ${o.pad} ${o.h / 2} ` +
  `L ${o.w - o.pad} ${o.h - o.pad} `

  