export class Loader<T> {
  protected _data?: T;
  protected _loader: () => Promise<T>;
  protected _loaded: boolean = false;
  protected _loading: boolean = false;
  private _on_loaded?: (data: T) => void;
  private _on_clear?: () => void;
  constructor(loader: () => Promise<T>, on_loaded?: (data: T) => void, on_clear?: () => void) {
    this._loader = loader;
    this._on_loaded = on_loaded;
    this._on_clear = on_clear;
  }
  get data(): T | undefined { return this._data; }
  get loaded(): boolean { return this._loaded; }
  get loading(): boolean { return this._loading; }
  get need_load(): boolean { return !this._loaded && !this._loading; }

  load(): Promise<T> {
    this._loading = true;
    return this._loader().then(data => {
      this._data = data;
      this._loaded = true;
      this._on_loaded?.(this._data);
      this._loading = false;
      return this._data;
    }).catch(e => {
      this._loading = false;
      throw e;
    });
  }

  clear(): void {
    this._loaded = false;
    delete this._data;
    this._on_clear?.();
  }
}
