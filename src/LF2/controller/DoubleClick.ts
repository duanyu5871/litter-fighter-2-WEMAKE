export class DoubleClick<D> {
  data: [D | undefined, D | undefined] = [void 0, void 0];
  time: number = 0;
  readonly name: string;
  readonly interval: number;
  constructor(name: string, interval: number) {
    this.name = name;
    this.interval = interval;
  }
  press(time: number, data: D) {
    if (this.time + time <= this.interval) {
      //  双击判定：间隔时间内再次按下
      this.time = time;
      this.data[1] = data;
    } else {
      // 双击判定：首次按下
      this.time = -time;
      this.data[0] = data;
      this.data[1] = void 0;
    }
  }
  reset() {
    this.time = 0;
    this.data = [void 0, void 0];
  }
}
export default DoubleClick;