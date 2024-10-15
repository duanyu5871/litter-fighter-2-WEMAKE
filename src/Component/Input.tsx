import React from 'react';
import './Input.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  _ref?: React.Ref<HTMLInputElement>;
}
export function Input(props: InputProps) {
  const { className, _ref, ...remain_props } = props;
  const root_className = className ? `lf2ui_input ${className}` : 'lf2ui_input'
  return <input {...remain_props} className={root_className} ref={_ref} />;
}
