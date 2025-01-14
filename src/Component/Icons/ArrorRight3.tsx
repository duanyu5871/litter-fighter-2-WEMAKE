import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrorRight3(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  return (
    <Base viewBox={o.size} {..._p}>
      <path className={Base.styles.text_stroke} d={o.path} />
    </Base>
  )
}
const o = ArrorRight3
ArrorRight3.pad = 1
ArrorRight3.w = 12;
ArrorRight3.h = 12;
ArrorRight3.size = `0, 0, ${o.w}, ${o.h}`
ArrorRight3.path =
  `M ${o.pad} ${o.pad} ` +
  `L ${o.w - o.pad} ${o.h / 2} ` +
  `L ${o.pad} ${o.h - o.pad} `

  