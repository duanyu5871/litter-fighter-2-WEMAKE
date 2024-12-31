import React from "react";

export interface ITitledProps extends React.HTMLAttributes<HTMLSpanElement> {

}
export default function Titled(props: ITitledProps) {
  const { className, ...p } = props;
  const cn = ["name_content", className].filter(Boolean).join(' ')
  return (
    <span {...p} className={cn}>
      <div style={{ display: 'inline-block' }}>
        {props.title}
      </div>
      {props.children}
    </span>
  );
}
