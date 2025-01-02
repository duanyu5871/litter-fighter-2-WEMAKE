import React from "react";
import "./Input.scss";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  _ref?: React.Ref<HTMLInputElement>;
}
export function Input(props: InputProps) {
  const { className, _ref, ..._p } = props;
  const root_className = className ? `lf2ui_input ${className}` : "lf2ui_input";
  return <input {..._p} className={root_className} ref={_ref} />;
}
