import { ForwardedRef, forwardRef } from "react";
import styles from "./style.module.scss";
import classnames from "classnames";
export interface IFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  active?: boolean;
  hoverable?: boolean;
}
export default forwardRef<HTMLDivElement, IFrameProps>(
  function Frame(props: IFrameProps, rorwarded_ref: ForwardedRef<HTMLDivElement>) {
    const { className, label, active, hoverable = true, ..._p } = props;
    const cls_name = classnames(styles.lfui_frame, {
      [styles.with_label]: label,
      [styles.active]: active,
      [styles.hoverable]: hoverable,
    }, className)
    return (
      <div {..._p} className={cls_name} ref={rorwarded_ref}>
        {label ? <span className={styles.label}>{label}</span> : null}
        {props.children}
      </div>
    );
  }
)
