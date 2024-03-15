export class FPS {
  get value() { return this._value; }
  private _value = 0;
  private _avg_duration = 0;
  private readonly _samples;
  constructor(samples: number = 1 / 100) {
    this._samples = samples;
  }
  update(dt: number) {
    if (this._avg_duration) {
      this._avg_duration = this._avg_duration * (1 - this._samples) + dt * this._samples;
    } else {
      this._avg_duration = dt;
    }
    this._value = 1 / this._avg_duration * 1000;
  }
  reset() {
    this._value = 0;
    this._avg_duration = 0;
  }
}
