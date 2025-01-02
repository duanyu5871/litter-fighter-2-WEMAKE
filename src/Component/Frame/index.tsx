import "./style.scss";
import classnames from "classnames";
export interface IFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
}
export default function Frame(props: IFrameProps) {
  const { className, label, ..._p } = props;
  const cls_name = classnames('lf2ui_frame', className)
  return (
    <div {..._p} className={cls_name}>
      {label ? <span className='label'>{label}</span> : null}

      {props.children}
    </div>
  );
}
