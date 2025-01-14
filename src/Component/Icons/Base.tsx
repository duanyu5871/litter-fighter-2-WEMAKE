import classNames from 'classnames';
import styles from './Clear/style.module.scss';
export interface IIconProps extends React.SVGAttributes<SVGSVGElement> {
  hoverable?: boolean;
}
export function Base(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} {..._p} />
  )
}
Base.styles = styles