import { Base } from "./Base";
import { IIconProps } from "./Clear";

export function Search(props: IIconProps) {
  return (
    <Base {...props}>
      <Base.Path d={o.path} />
      <circle {...o.circle} fill='none' stroke='currentColor' />
    </Base>
  )
}
const o = Object.assign(Search, Base)
Search.path = o.m(1, 11).l(3.8, 8.3).ok()
Search.circle = {
  cx: "7",
  cy: "5",
  r: "4.5",
}