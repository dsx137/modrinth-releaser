export function lazy<T extends { [key: string | symbol | number]: () => unknown }>(
  initializers: T
): { [K in keyof T]: ReturnType<T[K]> } {
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (!(prop in target) && prop in initializers) {
          target[prop] = initializers[prop]();
        }
        return target[prop];
      },
    }
  ) as { [K in keyof T]: ReturnType<T[K]> };
}
