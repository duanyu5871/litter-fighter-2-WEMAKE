
export const get_img = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const img_ele = document.createElement('img');
  img_ele.src = src;
  img_ele.onerror = rej;
  img_ele.onabort = () => rej(new Error('[load_image_ele] aborted!'));
  img_ele.onload = () => res(img_ele);
});
