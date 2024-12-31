import React from "react";

export interface ITitledProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'label' | 'title'> {
  label?: React.ReactNode;
  title?: React.ReactNode;
}
export default function Titled(props: ITitledProps) {
  const { className, label, title, children, ...p } = props;
  const cn = ["name_content", className].filter(Boolean).join(' ')
  return (
    <span {...p} className={cn}>
      <div style={{ display: 'inline-block', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
        {label ?? title}
      </div>
      {children}
    </span>
  );
}
