/** This module is browser compatible. */

/** Applies properties of mixins to instance. */
// deno-lint-ignore no-explicit-any
export function applyMixins<T>(instance: T, mixins: any[]) {
  mixins.forEach((mixin) => {
    Object.getOwnPropertyNames(mixin).forEach((name) => {
      if (name === "prototype") return;
      Object.defineProperty(
        instance,
        name,
        Object.getOwnPropertyDescriptor(
          mixin,
          name,
        ) as PropertyDescriptor,
      );
    });
  });
}

/** Applies properties of base class prototypes to instance. */
// deno-lint-ignore no-explicit-any
export function applyInstanceMixins<T>(instance: T, baseCtors: any[]) {
  applyMixins(
    instance,
    baseCtors.map((baseCtor) => baseCtor.prototype),
  );
}

/** Applies properties of base classes to class. */
export function applyClassMixins<T>(
  // deno-lint-ignore no-explicit-any
  ctor: { new (...args: any[]): T },
  // deno-lint-ignore no-explicit-any
  baseCtors: any[],
) {
  applyMixins(ctor, baseCtors);
  applyInstanceMixins(ctor.prototype, baseCtors);
}
