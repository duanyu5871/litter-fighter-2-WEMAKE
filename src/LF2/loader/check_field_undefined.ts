import Ditto from "../ditto";

export function check_field_undefined<T extends {}>(obj: T, obj_name: string, field_name: keyof T, expected_type: 'string' | 'number' | 'boolean' | any[]) {
  const { TAG } = check_field_undefined;
  const value = typeof obj[field_name];
  if (value === 'undefined') {
    return true;
  } else if (Array.isArray(expected_type)) {
    if (expected_type.some(v => v === value)) {
      Ditto.Warn(`[${TAG}] ${obj_name}.${field_name.toString()} must be ${expected_type.map(v => JSON.stringify(v)).join(" | ")} | undefined, but got ${value}.`);
      return false;
    }
  } else if (value !== expected_type) {
    Ditto.Warn(`[${TAG}] ${obj_name}.${field_name.toString()} must be ${expected_type} | undefined, but got ${value}.`);
    return false;
  }
  return true;
}
check_field_undefined.TAG = 'check_field_undefined';
