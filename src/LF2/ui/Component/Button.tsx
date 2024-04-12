import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function (props: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) {
  return <button type='button' {...props} ref={ref} />;
});
