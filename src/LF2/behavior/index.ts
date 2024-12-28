export namespace Behavior {
  export interface INode<Data = any, Context = any> {
    readonly is_bebavior_node: true;
    readonly name: string;
    data: Data;
    context: Context;
    on_enter?(from: IConn<Data, Context> | INode | undefined, self: this): void;
    on_leave?(to: IConn<Data, Context> | INode | undefined, self: this): void;
    on_update?(delta_time: number, self: this): void;
  }
  export interface IConn<
    Data1 = any,
    Context1 = any,
    Data2 = any,
    Context2 = any,
  > {
    readonly is_bebavior_conn: true;
    readonly start: INode<Data1, Context1>;
    readonly end: INode<Data2, Context2>;
    readonly judge: (
      delta_time: number,
      from: INode<Data1, Context1>,
      to: INode<Data2, Context2>,
    ) => boolean;
  }
  export function is_node(v: any): v is INode {
    return v && v.is_bebavior_node === true;
  }
  export function is_connection(v: any): v is IConn {
    return v && v.is_bebavior_conn === true;
  }
  export class Actor {
    is_debug: boolean = false;
    warn = (_msg: string) => {};
    protected _behavior?: INode;
    protected _behavior_map = new Map<string, INode>();
    protected _connection_list = new Map<string, IConn[]>();
    get behavior() {
      return this._behavior;
    }
    add_behavior(...behavior_array: (INode | _Noding)[]): this {
      for (const item of behavior_array) {
        const behavior = is_node(item) ? item : item.done();
        if (this.is_debug) {
          const other = this._behavior_map.get(behavior.name);
          if (other && other !== behavior) {
            this.warn(
              `behavior name ${JSON.stringify(behavior.name)} already exists, will replace it.`,
            );
            debugger;
          }
        }
        this._behavior_map.set(behavior.name, behavior);
      }
      return this;
    }

    find_behavior(name: string): INode | undefined {
      return this._behavior_map.get(name);
    }

    use_behavior(name: string) {
      const next = this.find_behavior(name);
      if (!next) {
        this.warn(`behavior name ${JSON.stringify(name)} not found.`);
        debugger;
        return this;
      }
      const prev = this._behavior;
      prev?.on_leave?.(next, prev);
      this._behavior = next;
      next.on_enter?.(prev, next);
      return this;
    }

    add_connection(...connections: (IConn | _Connecting)[]) {
      for (const what of connections) {
        const conn = is_connection(what) ? what : what.done();
        const { start, end } = conn;
        this.add_behavior(start, end);
        let connection_array = this._connection_list.get(start.name);
        if (!connection_array) {
          this._connection_list.set(start.name, (connection_array = []));
        }
        connection_array.push(conn);
      }
      return this;
    }

    update(delta_time: number) {
      if (!this._behavior) return;
      this._behavior.on_update?.(delta_time, this._behavior);
      const connections = this._connection_list.get(this._behavior.name);

      if (!connections?.length) return;
      for (const connection of connections) {
        if (!connection.judge?.(delta_time, connection.start, connection.end))
          continue;
        this._behavior.on_leave?.(connection, this._behavior);
        this._behavior = connection.end;
        connection.end.on_enter?.(connection, connection.end);
      }
    }
  }

  class _Noding<
    Data = any,
    Context = any,
    N extends INode<Data, Context> = INode<Data, Context>,
  > {
    private _name: N["name"];
    private _data: N["data"] | undefined;
    private _context: N["context"] | undefined;
    private _on_enter: N["on_enter"] | undefined;
    private _on_leave: N["on_leave"] | undefined;
    private _on_update: N["on_update"] | undefined;
    private _actor: Actor | undefined;
    get_data() {
      return this._data;
    }
    get_name() {
      return this._name;
    }
    get_context() {
      return this._on_enter;
    }
    get_on_enter() {
      return this._on_enter;
    }
    get_on_leave() {
      return this._on_leave;
    }
    get_on_update() {
      return this._on_update;
    }
    actor(v: Actor) {
      this._actor = v;
      return this;
    }
    on_enter(fn: N["on_enter"]) {
      this._on_enter = fn;
      return this;
    }
    on_leave(fn: N["on_leave"]) {
      this._on_leave = fn;
      return this;
    }
    on_update(fn: N["on_update"]) {
      this._on_update = fn;
      return this;
    }
    constructor(name: string, data: Data, context: Context) {
      this._name = name;
      this._data = data;
      this._context = context;
    }
    done(): N {
      const ret: INode = {
        is_bebavior_node: true,
        name: this._name,
        data: this._data,
        context: this._context,
        on_enter: this._on_enter,
        on_leave: this._on_leave,
        on_update: this._on_update,
      };
      if (this._actor) this._actor.add_behavior(ret);
      return ret as N;
    }
  }
  export function Noding<Data = any, Context = any>(
    name: string,
  ): _Noding<Data, Context>;
  export function Noding<Data = any, Context = any>(
    name: string,
    data: Data,
  ): _Noding<Data, Context>;
  export function Noding<Data = any, Context = any>(
    name: string,
    data: Data,
    context: Context,
  ): _Noding<Data, Context>;
  export function Noding<Data = any, Context = any>(
    name: string,
    data?: Data,
    context?: Context,
  ): _Noding {
    return new _Noding(name, data, context);
  }

  class _Connecting<D1 = any, C1 = any, D2 = any, C2 = any> {
    private _actor: Actor | undefined;
    private _judge: IConn["judge"] = () => false;
    private _start?: _Noding<any, any, INode<any, any>>;
    private _end?: _Noding<any, any, INode<any, any>>;

    constructor(actor?: Actor) {
      this._actor = actor;
    }
    get_start() {
      return this._start ? this._start : Noding("start_not_set");
    }
    get_end() {
      return this._end ? this._end : Noding("end_not_set");
    }

    actor(v: Actor) {
      this._actor = v;
      return this;
    }
    judge(fn: typeof this._judge): this {
      this._judge = fn;
      return this;
    }
    start(name: string): _Connecting<D1, C1, D2, C2>;
    start<Data = any>(name: string, data: Data): _Connecting<Data, C1, D2, C2>;
    start<Data = any, Context = any>(
      name: string,
      data: Data,
      context: Context,
    ): _Connecting<Data, Context, D2, C2>;
    start<Data = any, Context = any>(
      name: string,
      data?: Data,
      context?: Context,
    ): this {
      this._start = new _Noding(name, data, context) as any;
      return this;
    }

    end(name: string): _Connecting<D1, C1, D2, C2>;
    end<Data = any>(name: string, data: Data): _Connecting<D1, C1, Data, C2>;
    end<Data = any, Context = any>(
      name: string,
      data: Data,
      context: Context,
    ): _Connecting<D1, C1, Data, Context>;
    end<Data = any, Context = any>(
      name: string,
      data?: Data,
      context?: Context,
    ): this {
      this._end = new _Noding(name, data, context) as any;
      return this;
    }

    on_start_enter(...args: Parameters<_Noding<D1, C1>["on_enter"]>) {
      this.get_start().on_enter(...args);
      return this;
    }
    on_start_leave(...args: Parameters<_Noding<D1, C1>["on_leave"]>) {
      this.get_start().on_leave(...args);
      return this;
    }
    on_start_update(...args: Parameters<_Noding<D1, C1>["on_update"]>) {
      this.get_start().on_update(...args);
      return this;
    }
    on_end_enter(...args: Parameters<_Noding<D1, C1>["on_enter"]>) {
      this.get_end().on_enter(...args);
      return this;
    }
    on_end_leave(...args: Parameters<_Noding<D1, C1>["on_leave"]>) {
      this.get_end().on_leave(...args);
      return this;
    }
    on_end_update(...args: Parameters<_Noding<D1, C1>["on_update"]>) {
      this.get_end().on_update(...args);
      return this;
    }
    done(): IConn {
      const start = this.get_start();
      const end = this.get_end();

      const bebavior_s =
        this._actor?.find_behavior(start.get_name()) || start.done();
      const bebavior_e =
        this._actor?.find_behavior(end.get_name()) || end.done();

      bebavior_s.data = bebavior_s.data ?? start.get_data();
      bebavior_s.context = bebavior_s.context ?? start.get_context();
      bebavior_s.on_enter = bebavior_s.on_enter ?? start.get_on_enter();
      bebavior_s.on_leave = bebavior_s.on_leave ?? start.get_on_leave();
      bebavior_s.on_update = bebavior_s.on_update ?? start.get_on_update();

      bebavior_e.data = bebavior_e.data ?? end.get_data();
      bebavior_e.context = bebavior_e.context ?? end.get_context();
      bebavior_e.on_enter = bebavior_e.on_enter ?? end.get_on_enter();
      bebavior_e.on_leave = bebavior_e.on_leave ?? end.get_on_leave();
      bebavior_e.on_update = bebavior_e.on_update ?? end.get_on_update();

      const ret: IConn = {
        is_bebavior_conn: true,
        start: bebavior_s,
        end: bebavior_e,
        judge: this._judge,
      };
      if (this._actor) this._actor.add_connection(ret);
      return ret;
    }
  }

  export function Connecting(actor?: Actor) {
    return new _Connecting(actor);
  }
}
