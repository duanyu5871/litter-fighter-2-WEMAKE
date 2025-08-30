class _OneOf {
  readonly values: any[];
  constructor(values: any[]) {
    this.values = values
  }
  toString(): string {
    return `one_of(${this.values.map(v => JSON.stringify(v)).join()})`
  }
}
class _ArrayOf {

}
export function one_of(...values: any[]): _OneOf {
  return new _OneOf(values)
}
export function arr_of(): _ArrayOf {
  return new _ArrayOf()
}
export type Expected = _OneOf | _ArrayOf |
  "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" |
  "object" | "function"

export function check_field<T extends {}>(
  obj: T,
  obj_name: string,
  field_name: keyof T,
  expected: Expected | Expected[],
  error?: string[]
) {
  const { TAG } = check_field;
  const value = obj[field_name]
  const type_name = typeof value;
  const expecteds: Expected[] = Array.isArray(expected) ? expected : [expected];
  const expected_type_name = expecteds.some(expected => {
    if (expected instanceof _ArrayOf) {
      if (Array.isArray(value))
        return true;
    } else if (expected instanceof _OneOf) {
      if (expected.values.some(v => v === value))
        return true
    } else if (type_name === expected) {
      return true;
    }
  }) ? void 0 : expecteds.map(v => JSON.stringify(v)).join(" | ")

  if (expected_type_name) {
    const msg = `[${TAG}] ${obj_name}.${field_name.toString()} ` +
      `must be ${expecteds}, but got ${value}.`
    error?.push(msg);
    return false;
  }
  return true;
}
check_field.TAG = 'check_field';
