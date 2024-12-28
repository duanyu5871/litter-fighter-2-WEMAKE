export function constructor_name<V extends {}>(v: V) {
  return Object.getPrototypeOf(v).constructor.name;
}
