import { is_str } from "../../js_utils/is_str";
import { Defines } from "../../js_utils/lf2_type/defines";
import type LF2 from "../LF2";
import { IPlayer, Src } from "./IPlayer";

export default class ModernPlayer implements IPlayer {
  readonly ctx = new AudioContext();
  readonly lf2: LF2;
  protected _req_id: number = 0;
  protected _prev_bgm_url: string | null = null;
  protected _bgm_src_node: AudioBufferSourceNode | null = null;
  protected _map = new Map<string, AudioBuffer>();
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }

  has(name: string): boolean {
    return this._map.has(name);
  }

  preload(name: string, src: Src) {
    this.lf2.on_loading_content(`loading sound: ${name}`, 0);
    return (async () => {
      const s = await src;
      const url = is_str(s) ? s : URL.createObjectURL(s);
      return fetch(url)
        .then(buf => buf.arrayBuffer())
        .then(buf => this.ctx.decodeAudioData(buf))
        .then(buf => this._map.set(name, buf));
    })().finally(() => {
      this.lf2.on_loading_content(`loading sound: ${name}`, 100);
    })
  }

  stop_bgm() {
    if (!this._bgm_src_node) return;
    this._bgm_src_node.stop();
    this._prev_bgm_url = null;
  }
  play_bgm(name: string): () => void {
    if (this._prev_bgm_url === name) return () => { };
    this.stop_bgm();
    this._prev_bgm_url = name;
    ++this._req_id;

    const req_id = this._req_id;
    const ctx = this.ctx;
    const buf = this._map.get(name);
    const start = (buf: AudioBuffer) => {
      this._bgm_src_node = ctx.createBufferSource();
      this._bgm_src_node.buffer = buf;
      this._bgm_src_node.connect(ctx.destination);
      this._bgm_src_node.start();
    };
    if (buf) {
      start(buf);
    } else {
      fetch(name)
        .then(buf => buf.arrayBuffer())
        .then(buf => ctx.decodeAudioData(buf))
        .then(start);
    }
    return () => (req_id === this._req_id) && this.stop_bgm();
  }

  play(name: string, x?: number, y?: number, z?: number) {
    const buf = this._map.get(name);
    if (!buf) return;

    const edge_w = Defines.OLD_SCREEN_WIDTH / 2;
    const viewer_x = this.lf2.world.camera.position.x + edge_w;
    const sound_x = x ?? viewer_x;
    const l_vol = Math.max(0, 1 - Math.abs((sound_x - viewer_x + edge_w) / Defines.OLD_SCREEN_WIDTH));
    const r_vol = Math.max(0, 1 - Math.abs((sound_x - viewer_x - edge_w) / Defines.OLD_SCREEN_WIDTH));

    const ctx = this.ctx;
    const src_node = ctx.createBufferSource();
    src_node.buffer = buf;

    const splitter_node = this.ctx.createChannelSplitter(1);
    src_node.connect(splitter_node);

    const merger_node = this.ctx.createChannelMerger(2);

    const l_gain_node = this.ctx.createGain();
    l_gain_node.gain.value = l_vol;
    l_gain_node.connect(merger_node, 0, 0);
    splitter_node.connect(l_gain_node, 0);


    const r_gain_node = this.ctx.createGain();
    r_gain_node.gain.value = r_vol;
    r_gain_node.connect(merger_node, 0, 1);
    splitter_node.connect(r_gain_node, 0);

    merger_node.connect(this.ctx.destination);
    src_node.start();
  }
}
