import React from "react";
import "./Titled.scss";

export interface ITitledProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'label'> {
  label?: React.ReactNode;
}
export default function Titled(props: ITitledProps) {
  const { className, label, children, ...p } = props;
  const cn = ["name_content", className].filter(Boolean).join(' ')
  return (
    <div {...p} className={cn}>
      <div>
        {label}
      </div>
      {children}
    </div>
  );
}
