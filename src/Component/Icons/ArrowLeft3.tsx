import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrowLeft3(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  return (
    <Base viewBox={o.size} {..._p}>
      <path className={Base.styles.text_stroke} d={o.path} />
    </Base>
  )
}
const o = ArrowLeft3
ArrowLeft3.pad = 1
ArrowLeft3.w = 12;
ArrowLeft3.h = 12;
ArrowLeft3.size = `0, 0, ${o.w}, ${o.h}`
ArrowLeft3.path =
  `M ${o.w - o.pad} ${o.pad} ` +
  `L ${o.pad} ${o.h / 2} ` +
  `L ${o.w - o.pad} ${o.h - o.pad} `

  