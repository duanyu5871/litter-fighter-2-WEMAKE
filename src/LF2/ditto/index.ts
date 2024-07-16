import { IFullScreen } from "./fullscreen";
import { IRender } from "./IRender";
import { ITimeout } from "./ITimeout";
import { IKeyboard } from "./keyboard/IKeyboard";
import { IPointings } from "./pointings";
import { IZip } from "./zip/IZip";
export * from "./IRender";
export * from "./ITimeout";
export * from "./keyboard";
export * from "./pointings";
export * from "./zip";
export * from "./fullscreen";
export interface IDittoPack {
  readonly Timeout: ITimeout;
  readonly Interval: ITimeout;
  readonly Render: IRender;
  readonly MD5: (...args: string[]) => string;
  readonly Zip: {
    read_file(file: File): Promise<IZip>;
    read_buf(buf: Uint8Array): Promise<IZip>;
    download(url: string, on_progress: (progress: number, size: number) => void): Promise<IZip>;
  }
  readonly Keyboard: new (...arg: any[]) => IKeyboard;
  readonly Pointings: new (...arg: any[]) => IPointings;
  readonly FullScreen: new (...arg: any[]) => IFullScreen;
  setup(pack: Omit<IDittoPack, 'setup'>): void;
  [key: string]: any;
}
export default {
  setup(pack: Omit<IDittoPack, 'setup'>) {
    for (const k in pack) {
      const key = k as keyof IDittoPack;
      this[key] = pack[k];
    }
  },
} as IDittoPack;