import { IRender } from "./IRender";
import { ITimeout } from "./ITimeout";

export interface IDittoPack {
  readonly Timeout: ITimeout;
  readonly Interval: ITimeout;
  readonly Render: IRender;
  readonly md5: (...args: string[]) => string;
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