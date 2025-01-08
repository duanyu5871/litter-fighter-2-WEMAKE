import React from "react";
import styles from "./Titled.module.scss";
import classNames from "classnames";
import Show from "./Show";

export interface ITitledProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'label'> {
  label?: React.ReactNode;
  label_style?: React.CSSProperties;
  float_label?: React.ReactNode;
}
export default function Titled(props: ITitledProps) {
  const { className, label, label_style, float_label, children, ...p } = props;
  const clz_name = classNames(styles.titled, className)
  const lbl_clz_name = classNames(styles.label, className)
  const flbl_clz_name = classNames(styles.float_label, className)
  return (
    <div {...p} className={clz_name}>
      <Show.Div show={!!label} style={label_style} className={lbl_clz_name}>
        {label}
      </Show.Div>
      {children}
      <Show.Div show={!!float_label} className={flbl_clz_name}>
        {float_label}
      </Show.Div>
    </div>
  );
}
