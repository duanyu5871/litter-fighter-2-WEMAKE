import React from "react";

export default function Show(props: React.PropsWithChildren<{ show?: boolean }>) {
  const { show = true } = props;
  if (!show) return <></>;
  return <>{props.children}</>
}

export interface IShowDivProps extends React.HTMLAttributes<HTMLDivElement> {
  show?: any
}
export const Div = Show.Div = function (props: IShowDivProps) {
  const { show = true, ...remain_props } = props;
  if (!show) return <></>;
  return <div {...remain_props}>{props.children}</div>
}