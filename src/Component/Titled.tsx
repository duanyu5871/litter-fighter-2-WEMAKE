import React from "react";
import "./Titled.scss";

export interface ITitledProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'label'> {
  label?: React.ReactNode;
  label_style?: React.CSSProperties;
}
export default function Titled(props: ITitledProps) {
  const { className, label, label_style, children, ...p } = props;
  const cn = ["name_content", className].filter(Boolean).join(' ')
  return (
    <div {...p} className={cn}>
      <div style={label_style}>  {label} </div>
      {children}
    </div>
  );
}
