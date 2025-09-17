export interface IKeyEvent {
  readonly times: number;
  readonly key: string;
  readonly native: any | undefined;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  preventDefault(): void;
  interrupt(): void;
}
