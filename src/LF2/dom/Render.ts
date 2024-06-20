export default class Render {
  static handle_req_id_map = new Map<number, number>()

  static start(handler: (time: number) => void): number {
    let handle: number;
    let req_id: number;
    const func = (time: number) => {
      handler(time)
      req_id = window.requestAnimationFrame(func);
      this.handle_req_id_map.set(handle, req_id)
    }
    handle = req_id = window.requestAnimationFrame(func)
    this.handle_req_id_map.set(handle, req_id)
    return handle;
  };
  static stop(handle: number): void {
    const req_id = this.handle_req_id_map.get(handle)
    if (req_id) window.cancelAnimationFrame(req_id)
    this.handle_req_id_map.delete(handle)
  };
  private constructor() { }
}
