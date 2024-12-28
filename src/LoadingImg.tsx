export class LoadingImg {
  tid = 0;
  img: HTMLImageElement | null = null;
  set_element(img: HTMLImageElement | null) {
    this.img = img;
    if (!img) window.clearTimeout(this.tid);
    else this.start();
  }
  start() {
    const { img } = this;
    if (!img) return;
    const w = 132;
    const h = 84;
    img.style.objectPosition = "0px 0px";
    img.width = w;
    img.height = h;
    img.draggable = false;
    img.style.objectFit = "none";
    img.style.userSelect = "none";
    img.style.position = "fixed";
    img.style.margin = "auto";
    img.style.display = "block";
    img.style.transition = "opacity 1000ms";
    img.style.left = img.style.right = img.style.top = img.style.bottom = "0";
    let i = 0;
    const update = () => {
      window.clearTimeout(this.tid);
      i = (i + 1) % 44;
      const x = -w * (i % 15);
      const y = -h * Math.floor(i / 15);
      img.style.objectPosition = `${x}px ${y}px`;
      this.tid = window.setTimeout(update, i === 21 ? 1000 : 30);
    };
    update();
  }
  hide() {
    const { img } = this;
    if (!img) return;
    img.style.opacity = "0";
    window.clearTimeout(this.tid);
  }
  show() {
    const { img } = this;
    if (!img) return;
    img.style.opacity = "1";
  }
}
