/**
 * 数据加载器
 *
 * @export
 * @class Loader
 * @template T
 */
export class Loader<T> {
  /**
   * 加载ID
   *
   * 每次加载前，均被+=1，用于判断是否未最后一次加载
   * @protected
   * @type {number}
   */
  protected _jid: number = 0;
  protected _data?: T;
  protected _loader?: () => Promise<T>;
  protected _state: "loading" | "loaded" | "clean" = "clean";
  protected _on_resolve?: (data: T) => void;
  protected _on_reject?: (reason: any) => void;
  protected _on_clear?: () => void;

  /**
   * 数据
   *
   * @readonly
   * @type {(T | undefined)}
   */
  get data(): T | undefined {
    return this._data;
  }

  /**
   * 是否已加载
   *
   * @readonly
   * @type {boolean}
   */
  get loaded(): boolean {
    return this._state === "loaded";
  }

  /**
   * 是否加载中
   *
   * @readonly
   * @type {boolean}
   */
  get loading(): boolean {
    return this._state === "loading";
  }

  /**
   * 是否需要加载
   *
   * @readonly
   * @type {boolean}
   */
  get need_load(): boolean {
    return this._state === "clean";
  }

  /**
   * Creates an instance of Loader.
   *
   * @constructor
   * @param {?() => Promise<T>} [loader]
   * @param {?(data: T) => void} [on_resolve] 加载成功回调
   * @param {?() => void} [on_clear] 数据清空回调
   */
  constructor(
    loader?: () => Promise<T>,
    on_resolve?: (data: T) => void,
    on_clear?: () => void,
  ) {
    this._loader = loader;
    this._on_resolve = on_resolve;
    this._on_clear = on_clear;
  }

  /**
   * 加载数据
   *
   * @note 重复调用时，只会使用最后一次的数据
   * @throws 当loader函数未设置，将抛出Error，信息为：[Loader]loader not set.
   * @throws 当loader函数reject时，将抛出其reject的原因
   * @throws 当本次load未完成，再次调用load时，本次load将抛出Error，信息为：[Loader]data abandoned.
   * @returns {Promise<T>}
   */
  async load(): Promise<T> {
    if (!this._loader) throw this.no_loader();
    const jid = ++this._jid;
    this._state = "loading";
    return this.start(jid);
  }

  /**
   * 开始加载数据
   *
   * @protected
   * @async
   * @throws 当loader函数未设置，将抛出Error，信息为：[Loader]loader not set.
   * @throws 当loader函数reject时，将抛出其reject的原因
   * @throws 当加载ID不一致，再次调用load时，本次load将抛出Error，信息为：[Loader]data abandoned.
   * @param {number} jid 加载ID，若加载ID变化，本次加载的结果将会被抛弃
   * @returns {Promise<T>}
   */
  protected async start(jid: number): Promise<T> {
    if (!this._loader) throw this.no_loader();
    try {
      const data = await this._loader();
      if (jid !== this._jid) throw this.abandon();
      this._data = data;
      this._state = "loaded";
      this._on_resolve?.(this._data);
      return this._data;
    } catch (e) {
      if (jid === this._jid) {
        this._state = "clean";
        this._on_reject?.(e);
      }
      throw e;
    }
  }

  /**
   * 清空数据
   */
  clean(): void {
    ++this._jid;
    this._state = "clean";
    delete this._data;
    this._on_clear?.();
  }

  protected abandon(): Error {
    return new Error(`[${Loader.name}]data abandoned.`);
  }
  protected no_loader(): Error {
    return new Error(`[${Loader.name}]loader not set.`);
  }
}
