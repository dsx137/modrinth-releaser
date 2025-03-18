export function lazy<T extends { [key: string | symbol | number]: () => unknown }>(
  initializers: T
): { [K in keyof T]: ReturnType<T[K]> } {
  return new Proxy({} as { [K in keyof T]: ReturnType<T[K]> }, {
    get(target, prop) {
      if (!(prop in target) && prop in initializers) {
        target[prop as keyof T] = initializers[prop]() as ReturnType<T[keyof T]>;
      }
      return target[prop];
    },
  });
}
