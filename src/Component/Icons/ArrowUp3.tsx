import { Base } from './Base';
import { IIconProps } from './Clear';

export function ArrowUp3(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  return (
    <Base viewBox={o.size} {..._p}>
      <path className={Base.styles.text_stroke} d={o.path} />
    </Base>
  )
}
const o = ArrowUp3
ArrowUp3.pad = 1
ArrowUp3.w = 12;
ArrowUp3.h = 12;
ArrowUp3.size = `0, 0, ${o.w}, ${o.h}`
ArrowUp3.path =
  `M ${o.pad} ${o.h - o.pad} ` +
  `L ${o.w / 2} ${o.pad} ` +
  `L ${o.w - o.pad} ${o.h - o.pad} `
