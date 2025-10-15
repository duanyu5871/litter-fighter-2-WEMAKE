import type { CSSProperties, ForwardedRef, HTMLAttributes } from "react";
import { forwardRef } from "react";
export interface IFlexProps extends HTMLAttributes<HTMLDivElement> {
  inline?: boolean,
  direction?: CSSProperties['flexDirection'],
  align?: CSSProperties['alignItems'],
  justify?: CSSProperties['justifyContent'],
  gap?: CSSProperties['gap'],
}
function _Flex(props: IFlexProps, ref: ForwardedRef<HTMLDivElement>) {
  const {
    inline = false,
    direction = 'row',
    align,
    justify,
    gap,
    style,
    ..._p
  } = props;

  const _style: CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    ...style,
    gap
  }
  return <div {..._p} style={_style} ref={ref} />
}
export const Flex = forwardRef<HTMLDivElement, IFlexProps>(_Flex)