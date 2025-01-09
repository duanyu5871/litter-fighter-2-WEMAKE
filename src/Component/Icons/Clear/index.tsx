import classNames from 'classnames';
import styles from './style.module.scss'
export interface IIconProps extends React.SVGAttributes<SVGSVGElement> {
  hoverable?: boolean;
}
export function Clear(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox="0, 0, 12, 12" {..._p}>
      <circle className={styles.secondary_fill} cx="6" cy="6" r="5" />
      <path className={styles.main_stroke} d="M 4 4 L 8 8" />
      <path className={styles.main_stroke} d="M 4 8 L 8 4" />
    </svg>
  )
}
export function DropdownArrow(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox="0, 0, 12, 12" {..._p} >
      <path className={styles.text_stroke} d="M 3 4.5 L 6 7.5 L 9 4.5" />
    </svg>
  )
}
export function Tick(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox="0, 0, 12, 12" {..._p} >
      <path className={styles.text_stroke} d="M 1 6.5 L 4 9.5 L 10 3.5" />
    </svg>
  )
}
export function Close(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox="0, 0, 12, 12" {..._p}>
      <path className={styles.bg_stroke} d="M 4 4 L 8 8" />
      <path className={styles.bg_stroke} d="M 4 8 L 8 4" />
    </svg>
  )
}
export function Close2(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox="0, 0, 12, 12" {..._p}>
      <path className={styles.border_stroke} d="M 4 4 L 8 8" />
      <path className={styles.border_stroke} d="M 4 8 L 8 4" />
    </svg>
  )
}
export function Close3(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox="0, 0, 12, 12" {..._p}>
      <path className={styles.text_stroke} d="M 2 2 L 10 10" />
      <path className={styles.text_stroke} d="M 2 10 L 10 2" />
    </svg>
  )
}

export function Add(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox="0, 0, 12, 12" {..._p}>
      <path className={styles.text_stroke} d="M 6 0 L 6 12" />
      <path className={styles.text_stroke} d="M 0 6 L 12 6" />
    </svg>
  )
}

export function Search(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox="0, 0, 12, 12" {..._p}>
      <path className={styles.text_stroke} d="M 1 11 L 3.8 8.3" />
      <circle className={styles.text_stroke} cx="7" cy="5" r="4.5" />
    </svg>
  )
}