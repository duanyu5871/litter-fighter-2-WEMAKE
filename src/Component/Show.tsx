import React from "react";

export default function Show(props: React.PropsWithChildren<{ show?: any }>) {
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
