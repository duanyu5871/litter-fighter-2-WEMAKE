import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrowRight3(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  return (
    <Base viewBox={o.size} {..._p}>
      <path className={Base.styles.text_stroke} d={o.path} />
    </Base>
  )
}
const o = ArrowRight3
ArrowRight3.pad = 1
ArrowRight3.w = 12;
ArrowRight3.h = 12;
ArrowRight3.size = `0, 0, ${o.w}, ${o.h}`
ArrowRight3.path =
  `M ${o.pad} ${o.pad} ` +
  `L ${o.w - o.pad} ${o.h / 2} ` +
  `L ${o.pad} ${o.h - o.pad} `

  