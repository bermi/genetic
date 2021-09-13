/** This module is browser compatible. */

/**
 * Compares its two arguments for ascending order using JavaScript's built in comparison operators.
 * All undefined elements are sorted to the end.
 */
export function ascend<T>(a: T | undefined, b: T | undefined) {
  return typeof a === "undefined"
    ? (typeof b === "undefined" ? 0 : 1)
    : typeof b === "undefined"
    ? -1
    : a < b
    ? -1
    : a > b
    ? 1
    : 0;
}

/**
 * Compares its two arguments for descending order using JavaScript's built in comparison operators.
 * All undefined elements are sorted to the end.
 */
export function descend<T>(a: T | undefined, b: T | undefined) {
  return typeof a === "undefined"
    ? (typeof b === "undefined" ? 0 : 1)
    : typeof b === "undefined"
    ? -1
    : a < b
    ? 1
    : a > b
    ? -1
    : 0;
}
