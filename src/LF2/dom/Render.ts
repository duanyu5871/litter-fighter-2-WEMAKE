export default class Render {
  static readonly run = requestAnimationFrame;
  static readonly stop = cancelAnimationFrame;
  private constructor() { }
}
