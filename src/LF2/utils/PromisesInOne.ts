import Ditto from "../ditto";

export type PromiseId = string;
export type PromiseCallbacks<Data> = {
  resolve: (v: Data) => void;
  reject: (e: any) => void;
};
export type PromiseCallbacksPool<Data> = {
  [key in PromiseId]?: PromiseCallbacks<Data>[];
};

export class PromiseInOne<Data = any> {
  private promisePool: PromiseCallbacksPool<Data> = {};

  private genPromiseId(type: string, args: any): PromiseId {
    return type + Ditto.MD5(JSON.stringify(args));
  }

  intoPool(
    type: string,
    args: any,
    resolve: (v: Data) => void,
    reject: (e: any) => void,
  ): [string, boolean] {
    const promiseId = this.genPromiseId(type, args);
    const existed = !!this.promisePool[promiseId];
    if (!existed) this.promisePool[promiseId] = [{ resolve, reject }];
    else this.promisePool[promiseId]?.push({ resolve, reject });
    return [promiseId, existed];
  }

  rejectPromise(promiseId: PromiseId, e: any) {
    this.promisePool[promiseId]?.forEach((v) => v.reject(e));
    delete this.promisePool[promiseId];
  }

  resolvePromise(promiseId: PromiseId, d: Data) {
    this.promisePool[promiseId]?.forEach((v) => v.resolve(d));
    delete this.promisePool[promiseId];
  }

  async handlePromise(promiseId: PromiseId, promise: Promise<Data>) {
    try {
      const reply = await promise;
      return this.resolvePromise(promiseId, reply);
    } catch (err) {
      return this.rejectPromise(promiseId, err);
    }
  }
}

const pio = new PromiseInOne();
export function PIO<T extends Object, K extends keyof T>(
  target: T,
  key: K,
  descriptor: TypedPropertyDescriptor<T[K]>,
) {
  const old = descriptor.value as any;
  if (typeof old !== "function") return descriptor;
  const name = target.constructor.name + "." + key.toString() + ".";
  descriptor.value = function (...args: Parameters<typeof old>) {
    return new Promise<any>((resolve, reject) => {
      const [pid, existed] = pio.intoPool(name, args, resolve, reject);
      if (existed) return;
      const real_promise = old.apply(this, args);
      pio.handlePromise(pid, real_promise);
    });
  } as any;
  return descriptor;
}
