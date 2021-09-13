/** This module is browser compatible. */

export type compare<T> = (a: T | undefined, b: T | undefined) => number;
export type compareDefined<T> = (a: T, b: T) => number;
export type map<T, U> = (value: T | undefined, index: number) => U | undefined;
export type mapDefined<T, U> = (value: T, index: number) => U;
export type direction = "left" | "right";

/** Directions on a binary search tree node. */
export const directions: direction[] = ["left", "right"];

/** Swaps the values at two indexes in an array. */
export function swap<T>(array: T[], a: number, b: number) {
  const temp: T = array[a];
  array[a] = array[b];
  array[b] = temp;
}

export interface RandomIntOptions {
  /** The exclusive upper bound for the range. */
  end: number;
  /** The inclusive lower bound for the range. Defaults to 0. */
  start?: number;
}

/**
 * Returns a random integer within a range.
 */
export function randomInt(options: RandomIntOptions) {
  const start: number = options.start ?? 0;
  return start + Math.floor(Math.random() * Math.floor(options.end - start));
}

export interface RangeOptions {
  /** The exclusive upper bound for a range. */
  end: number;
  /** The inclusive lower bound for a range. Defaults to 0. */
  start?: number;
  /** The value to increment by. Defaults to 1. */
  step?: number;
}

/**
 * Generates an array of integers within a range.
 */
export function* range(options: RangeOptions): IterableIterator<number> {
  const start: number = options.start ?? 0;
  const step: number = options.step ?? 1;
  const count: number = Math.floor((options.end - start) / step);
  if (count < 0) throw new Error("invalid range");
  const keys: IterableIterator<number> = Array(count).keys();
  for (const key of keys) yield start + (key * step);
}

/**
 * Shuffles an array in-place using the
 * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm)
 * algorithm then returns it.
 */
export function shuffle<T>(arr: Array<T>): Array<T> {
  for (let i = arr.length - 1; i > 0; i--) {
    const randomIndex: number = randomInt({ end: i + 1 });
    const temp: T = arr[i];
    arr[i] = arr[randomIndex];
    arr[randomIndex] = temp;
  }
  return arr;
}

/**
 * Counts the number of occurances for each value.
 */
export function count<T>(arr: Iterable<T>): Map<T, number> {
  const counts: Map<T, number> = new Map();
  for (const value of arr) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}
