import classNames from 'classnames';
import styles from './Clear/style.module.scss';
export interface IIconProps extends React.SVGAttributes<SVGSVGElement> {
  hoverable?: boolean;
}
export function Base(props: IIconProps) {
  const { className, hoverable, ..._p } = props;
  const clz_name = classNames(styles.ic, { [styles.hoverable]: hoverable }, className)
  return (
    <svg width='1em' height='1em' className={clz_name} viewBox={o.size} {..._p} />
  )
}
export function Path(props: React.SVGAttributes<SVGPathElement>) {
  return <path fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' {...props} />
}
const o = Base
Base.pad = 2
Base.w = 12;
Base.h = 12;
Base.size = `0, 0, ${o.w}, ${o.h}`
Base.Path = Path
Base.styles = styles
Base.m = (x: number, y: number = x, ...nums: number[]) => {
  return new PathDrawer(x, y).l(...nums);
}
class PathDrawer {
  private _m: string;
  private _l: string[] = [];

  constructor(x: number, y: number, ...nums: number[]) {
    this._m = `M ${x} ${y}`
    this.l(...nums);
  }
  l(...nums: number[]): this {
    for (let i = 0; i < nums.length; i += 2) {
      const x = nums[i]
      const y = nums[i + 1] ?? x;
      this._l.push(`L ${x} ${y}`);
    }
    return this
  }
  ok(): string {
    return this._m + ' ' + this._l.join(' ')
  }
}