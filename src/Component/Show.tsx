import React from "react";

export interface IShowProps extends React.PropsWithChildren<{ show?: any }> { }
export default function Show(props: IShowProps) {
  if (!("show" in props)) return <></>;
  if (!props.show) return <></>;
  return <>{props.children}</>;
}

export interface IShowDivProps extends React.HTMLAttributes<HTMLDivElement> {
  show?: any;
  _ref?: React.LegacyRef<HTMLDivElement>
}
export const Div = (Show.Div = function (props: IShowDivProps) {
  const { show, children, _ref, ..._p } = props;
  if (!show) return <></>;
  return <div {..._p} ref={_ref}>{children}</div>;
});
