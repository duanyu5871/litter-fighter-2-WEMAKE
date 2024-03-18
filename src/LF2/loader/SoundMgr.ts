import { is_str } from "../../js_utils/is_str";
import { Defines } from "../../js_utils/lf2_type/defines";
import LF2 from "../LF2";
type Src = string | Blob | Promise<string | Blob>;
interface IPlayer {
  stop_bgm(): void;
  play_bgm(url: string): () => void;
  preload(name: string, src: Src): Promise<any>
  play(name: string, x?: number, y?: number, z?: number): void;
}
class FallbackSoundPlayer implements IPlayer {
  protected _map = new Map<string, string>();
  private _prev_bgm_url: string | null = null;
  private _bgm?: HTMLAudioElement;
  private _req_id: number = 0;
  stop_bgm() {
    if (!this._bgm) return;
    this._bgm.pause();
    delete this._bgm;
    this._prev_bgm_url = null;
  }
  play_bgm(src: string): () => void {
    if (this._prev_bgm_url === src) return () => { };
    if (this._bgm) this.stop_bgm()
    this._bgm = document.createElement('audio');
    this._bgm.src = src;
    this._bgm.controls = false;
    this._bgm.loop = true
    this._bgm.play();
    ++this._req_id;
    const req_id = this._req_id;
    this._prev_bgm_url = src;
    return () => {
      if (req_id === this._req_id) this.stop_bgm()
    };

  }
  async preload(key: string, src: Src): Promise<any> {
    const s = await src;
    const url = is_str(s) ? s : URL.createObjectURL(s)
    this._map.set(key, url);
  }
  play(name: string, x?: number, y?: number, z?: number) {
    const src_audio = this._map.get(name);
    if (!src_audio) return;
    const audio = document.createElement('audio');
    audio.src = src_audio;
    audio.controls = false;
    audio.onerror = e => console.log('failed:', name)
    return audio.play();
  }
}

class SoundPlayer implements IPlayer {
  readonly ctx = new AudioContext();
  readonly mgr: SoundMgr;
  private _req_id: number = 0;
  private _prev_bgm_url: string | null = null;
  private _bgm_src_node: AudioBufferSourceNode | null = null;
  private _map = new Map<string, AudioBuffer>();
  constructor(mgr: SoundMgr) {
    this.mgr = mgr;
  }


  async preload(key: string, src: Src) {
    const s = await src;
    const url = is_str(s) ? s : URL.createObjectURL(s)
    return fetch(url)
      .then(buf => buf.arrayBuffer())
      .then(buf => this.ctx.decodeAudioData(buf))
      .then(buf => this._map.set(key, buf))
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
    }
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

    
    const edge_w = Defines.OLD_SCREEN_WIDTH / 2
    const viewer_x = this.mgr.lf2.world.camera.position.x + edge_w;
    const sound_x = x ?? viewer_x;
    const l_vol = Math.max(0, 1 - Math.abs((sound_x - viewer_x + edge_w) / Defines.OLD_SCREEN_WIDTH))
    const r_vol = Math.max(0, 1 - Math.abs((sound_x - viewer_x - edge_w) / Defines.OLD_SCREEN_WIDTH))

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

    console.log(merger_node.numberOfInputs, l_vol, r_vol)

    src_node.start();


    // l_gain_node.gain.setValueAtTime(1, ctx.currentTime);
    // l_gain_node.gain.setValueAtTime(1, ctx.currentTime);
  }
}

export class SoundMgr {
  protected _map = new Map<string, string>();
  readonly lf2: LF2;
  readonly player: IPlayer;
  constructor(lf2: LF2) {
    this.player = new SoundPlayer(this)
    this.lf2 = lf2;
  }
  load(key: string, src: Src) {
    return this.player.preload(key, src);
  }
  stop_bgm() { this.player.stop_bgm() }
  play_bgm(name: string): () => void {
    return this.player.play_bgm(name)
  }
  play(name: string, x?: number, y?: number, z?: number) {
    return this.player.play(name, x, y, z)
  }
}

