import React from "react";
import styles from "./Titled.module.scss";
import classnames from "classnames";
import Show from "./Show";
export interface IClassnames {
  label?: string
  float_label?: string
}
export interface IStyles {
  label?: React.CSSProperties
  float_label?: React.CSSProperties
}
export interface ITitledProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'label'> {
  label?: React.ReactNode;
  float_label?: React.ReactNode;
  classNames?: IClassnames;
  styles?: IStyles;
}
export default function Titled(props: ITitledProps) {
  const { className, label, float_label, classNames: _c, children, styles: _s, ...p } = props;
  const clz_name = classnames(styles.titled, className)
  const lbl_clz_name = classnames(styles.label, _c?.label)
  const flbl_clz_name = classnames(styles.float_label, _c?.float_label)
  return (
    <div {...p} className={clz_name}>
      <Show.Div show={!!label} style={_s?.label} className={lbl_clz_name}>
        {label}
      </Show.Div>
      {children}
      <Show.Div show={!!float_label} className={flbl_clz_name} style={_s?.float_label}>
        {float_label}
      </Show.Div>
    </div>
  );
}
