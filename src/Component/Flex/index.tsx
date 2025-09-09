import React from "react"
export interface IFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  inline?: boolean,
  direction?: React.CSSProperties['flexDirection'],
  align?: React.CSSProperties['alignItems'],
  justify?: React.CSSProperties['justifyContent'],
  gap?: React.CSSProperties['gap'],
}
export function Flex(props: IFlexProps) {
  const {
    inline = false,
    direction = 'row',
    align,
    justify,
    gap,
    ..._p
  } = props;
  const style: React.CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    gap
  }
  return <div {..._p} style={style} />
}