import React from "react";

export default function Show(props: React.PropsWithChildren<{ show?: any }>) {
  if (!('show' in props)) return <></>
  if (!props.show) return <></>;
  return <>{props.children}</>
}

export interface IShowDivProps extends React.HTMLAttributes<HTMLDivElement> {
  show?: any
}
export const Div = Show.Div = function (props: IShowDivProps) {
  const { show, ...remain_props } = props;
  if (!show) return <></>;
  return <div {...remain_props}>{props.children}</div>
}