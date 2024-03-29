
export interface IEaseMethod<Factor = number, Value = number> {
  (factor: Factor, from?: Value, to?: Value): Value;
  backward(value: Value, from?: Value, to?: Value): Factor;
}
