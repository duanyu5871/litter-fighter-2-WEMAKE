export const defaultTimes = 3
export const defaultInterval = 500
/**
 * 连发检测器
 */
export class ContinuousDetector {
  private _timerId?: NodeJS.Timeout
  private _curTimes: number = 0
  private _interval: number
  private _times: number
  private _func?: (self: ContinuousDetector) => void

  constructor(times = defaultTimes, interval = defaultInterval) {
    this._times = times > 0 ? Math.ceil(times) : defaultTimes
    this._interval = interval > 0 ? Math.ceil(interval) : defaultInterval
  }

  check(func = this._func) {
    const onTimeout = () => {
      this._curTimes = 0
      this._timerId = undefined
    }
    this._timerId && clearTimeout(this._timerId)
    this._timerId = setTimeout(onTimeout, this._interval)
    ++this._curTimes
    if (this._curTimes >= this._times)
      func && func(this)
  }

  checker(func = this._func){
    return ()=>this.check(func)
  }
}