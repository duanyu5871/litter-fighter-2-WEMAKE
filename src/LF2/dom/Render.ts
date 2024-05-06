export default class Render {
  static run(handler: (time: number) => void) {
    return window.requestAnimationFrame(handler);
  };
  static stop(handle: number): void {
    return window.cancelAnimationFrame(handle);
  };
  private constructor() { }
}
