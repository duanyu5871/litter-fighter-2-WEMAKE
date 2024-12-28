export const get_blob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((res, rej) => {
    canvas.toBlob((b) => {
      b ? res(b) : rej(new Error(`[load_canvas_blob] failed! blob got ${b}!`));
    });
  });
