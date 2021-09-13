/** This module is browser compatible. */

import type { compare, map } from "./common.ts";

const maxCapacity: number = Math.pow(2, 32) - 1;

function positiveIndex(length: number, index: number, inclusive = false) {
  index = Math.floor(index);
  if (index < -length) index = 0;
  if (index < 0) index += length;
  if (index >= length) index = length - (inclusive ? 1 : 0);
  return index;
}

function reduce<T, U>(
  iterator: IterableIterator<T>,
  length: number,
  step: -1 | 1,
  callback: (previousValue: U, currentValue: T, currentIndex: number) => U,
  initialValue?: U,
): U {
  if (typeof initialValue === "undefined" && length === 0) {
    throw new TypeError("cannot reduce empty vector with no initial value");
  }
  let result: U;
  let index: number = step < 0 ? length - 1 : 0;
  if (typeof initialValue === "undefined") {
    result = iterator.next().value;
    index += step;
  } else {
    result = initialValue;
  }
  for (const current of iterator) {
    result = callback(result, current, index);
    index += step;
  }
  return result;
}

export type mapVector<T, U> = (
  v: T | undefined,
  k: number,
  vector: Vector<T>,
) => U | undefined;

/**
 * A double-ended queue implemented with a growable ring buffer.
 * Vector is faster than JavaScript's built in Array class for shifting and unshifting
 * because it only requires reallocation when increasing the capacity.
 */
export class Vector<T> implements Iterable<T> {
  private data: (T | undefined)[];
  private _capacity = 0;
  private _length = 0;
  private start = 0;
  private end = -1;

  constructor(capacity: number = 0) {
    if (
      typeof capacity !== "number" || Math.floor(capacity) !== capacity
    ) {
      throw new TypeError("invalid capacity");
    } else if (capacity < 0 || capacity > maxCapacity) {
      throw new RangeError("invalid capacity");
    }
    this._capacity = capacity;
    this.data = [];
    this.data.length = capacity;
  }

  /** Creates a new vector from an array like or iterable object. */
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | Vector<T>,
  ): Vector<U>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | Vector<T>,
    options: {
      map: map<T, U>;
      thisArg?: V;
    },
  ): Vector<U>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | Vector<T>,
    options?: {
      map: map<T, U>;
      thisArg?: V;
    },
  ): Vector<U> {
    let result: Vector<U>;
    if (collection instanceof Vector) {
      if (options?.map) {
        result = collection.map(options.map, options.thisArg);
      } else {
        result = new Vector();
        result.data = Array.from(collection.data) as (U | undefined)[];
        result._capacity = collection.capacity;
        result._length = collection.length;
        result.start = collection.start;
        result.end = collection.end;
      }
    } else {
      result = new Vector();
      result.data = options?.map
        ? Array.from(collection, options?.map, options?.thisArg)
        : Array.from(collection as (U | undefined)[]);
      result._length = result.data.length;
      result._capacity = result._length;
      result.start = 0;
      result.end = result._length - 1;
    }
    return result;
  }

  /**
   * The amount of values stored in the vector.
   * You can set the length to truncate the vector.
   * If you increase the length by setting it, the new slots will be empty.
   */
  get length(): number {
    return this._length;
  }
  set length(value: number) {
    if (value === 0) {
      if (this.length !== 0) this.data = [];
      this.data.length = this.capacity;
      this.start = 0;
      this.end = -1;
    } else if (
      typeof value !== "number" || Math.floor(value) !== value
    ) {
      throw new TypeError("invalid length");
    } else if (value < 0 || value > maxCapacity) {
      throw new RangeError("invalid length");
    } else if (value < this.length) {
      const previousEnd: number = this.end;
      this.end = (this.start + value - 1) % this.capacity;
      if (previousEnd < this.start && this.end >= this.start) {
        this.data.fill(undefined, this.end + 1, this.capacity);
        this.data.fill(undefined, 0, previousEnd + 1);
      } else {
        this.data.fill(undefined, this.end + 1, previousEnd + 1);
      }
    } else if (value > this.capacity) {
      this.capacity = value;
      this.end = (this.start + value - 1) % this.capacity;
    } else if (value > this.length) {
      this.end = (this.start + value - 1) % this.capacity;
    }
    this._length = value;
  }

  /**
   * The vector will be able to hold this many values without reallocating.
   * If the length exceeds the capacity, then the capacity will be increased.
   * Changing the capacity may trigger reallocation.
   * Changing the capacity to less than the length will change
   * the length to be equal to the new capacity.
   */
  get capacity(): number {
    return this._capacity;
  }
  set capacity(value: number) {
    if (value === 0) {
      this._capacity = 0;
      this.clear();
    } else if (
      typeof value !== "number" || Math.floor(value) !== value
    ) {
      throw new TypeError("invalid capacity");
    } else if (value < 0 || value > maxCapacity) {
      throw new RangeError("invalid capacity");
    } else if (value < this.length) {
      this._length = value;
      this.end = (this.start + value - 1) % this.capacity;
      this.data = this.toArray();
      this.start = 0;
      this.end = value - 1;
    } else if (this.end < this.start && value !== this.capacity) {
      this.data = this.data
        .slice(this.start, this.capacity)
        .concat(this.data.slice(0, this.end + 1));
      this.start = 0;
      this.end = this.length - 1;
    } else if (this.end >= value) {
      this.data = this.data.slice(this.start, this.end + 1);
      this.start = 0;
      this.end = this.length - 1;
    }
    this.data.length = value;
    this._capacity = value;
  }

  /**
   * Returns the value at the given index.
   * If the value is negative, it will be subtracted from the end.
   * The index 0 would return the first value in the vector.
   * The index -1 would return the last value in the vector.
   */
  get(index: number): T | undefined {
    if (index < -this.length || index >= this.length) return;
    index = positiveIndex(this.length, index);
    index = (this.start + index) % this.capacity;
    return this.data[index];
  }

  /**
   * Sets the value at the given index, then returns the value.
   * If the value is negative, it will be subtracted from the end.
   * The index 0 would set the first value in the vector.
   * The index -1 would set the last value in the vector.
   * If the absolute index value is greater than the length,
   * the size will be increased to match before setting the value.
   */
  set(index: number, value: T | undefined) {
    const offset: number = (index < 0 ? Math.abs(index) : (index + 1)) -
      this.length;
    if (offset > 0) {
      const newLength: number = this.length + offset;
      let newCapacity: number = this.capacity || 1;
      while (newCapacity < newLength) newCapacity *= 2;
      this.capacity = newCapacity;
      this.length = newLength;
    }
    if (index < 0) {
      if (offset > 0) {
        this.start -= offset;
        this.end -= offset;
        if (this.start < 0) this.start += this.capacity;
        if (this.end < 0) this.end += this.capacity;
      }
      index = this.end + index + 1;
      if (index < 0) index = this.capacity + index;
    } else {
      index = (this.start + index) % this.capacity;
    }
    this.data[index] = value;
    return value;
  }

  /**
   * Removes and returns the value at index from the vector.
   * If the value is negative, it will be subtracted from the end.
   * The values between the index and the end will be shifted to the left.
   */
  delete(index: number): T | undefined {
    let value: T | undefined;
    if (
      this.length !== 0 && index < this.length && index >= -this.length
    ) {
      value = this.splice(index, 1).get(0);
    }
    return value;
  }

  /** Shrinks the capacity to be equal to the length. */
  shrinkToFit(): void {
    this.capacity = this.length;
  }

  /** Returns the first value in the vector, or undefined if it is empty. */
  peek(): T | undefined {
    return this.data[this.start];
  }

  /** Removes the first value from the vector and returns it, or undefined if it is empty. */
  shift(): T | undefined {
    const result = this.data[this.start];
    if (this.length > 0) {
      this.data[this.start] = undefined;
      this._length--;
      this.start = this.start === this.capacity
        ? 0
        : ((this.start + 1) % this.capacity);
    }
    return result;
  }

  /** Adds values to the start of the vector. */
  unshift(...values: T[]): number {
    const newLength: number = this.length + values.length;
    let newCapacity: number = this.capacity || 1;
    while (newCapacity < newLength) newCapacity *= 2;
    this.capacity = newCapacity;
    this.length = newLength;
    this.start = values.length < this.start
      ? (this.start - values.length)
      : (this.capacity - values.length + this.start);
    this.end = (this.start + this.length - 1) % this.capacity;
    let index: number = this.start;
    for (const value of values) {
      this.data[index++ % this.capacity] = value;
    }
    return this.length;
  }

  /** Returns the last value in the vector, or undefined if it is empty. */
  peekRight(): T | undefined {
    return this.data[this.end];
  }

  /** Removes the last value from the vector and returns it, or undefined if it is empty. */
  pop(): T | undefined {
    const result = this.data[this.end];
    if (this.length > 0) {
      this.data[this.end] = undefined;
      this._length--;
      this.end = (this.end || this.capacity) - 1;
    }
    return result;
  }

  /** Adds values to the end of the vector. */
  push(...values: T[]): number {
    const oldLength: number = this.length;
    const newLength: number = oldLength + values.length;
    let newCapacity: number = this.capacity || 1;
    while (newCapacity < newLength) newCapacity *= 2;
    this.capacity = newCapacity;
    this.length = newLength;
    let index: number = (this.start + oldLength) % this.capacity;
    for (const value of values) {
      this.data[index++ % this.capacity] = value;
    }
    return this.length;
  }

  /**
   * Applies a function against an accumulator and each value of the vector (from left-to-right) to reduce it to a single value.
   * If no initial value is supplied, the first value in the vector will be used and skipped.
   * Calling reduce on an empty array without an initial value creates a TypeError.
   */
  reduce<U>(
    callback: (previousValue: U, currentValue: T, currentIndex: number) => U,
    initialValue?: U,
  ): U {
    return reduce(this.values(), this.length, 1, callback, initialValue);
  }

  /**
   * Applies a function against an accumulator and each value of the vector (from right-to-left) to reduce it to a single value.
   * If no initial value is supplied, the last value in the vector will be used and skipped.
   * Calling reduce on an empty array without an initial value creates a TypeError.
   */
  reduceRight<U>(
    callback: (previousValue: U, currentValue: T, currentIndex: number) => U,
    initialValue?: U,
  ): U {
    return reduce(this.valuesRight(), this.length, -1, callback, initialValue);
  }

  /**
   * Creates and returns a new string concatenating all of the values in the Vector,
   * converted to strings using their toString methods and
   * separated by commas or a specified separator string.
   */
  join(separator = ","): string {
    const iterator: IterableIterator<T> = this.values();
    let result = "";
    let started = false;
    for (const value of iterator) {
      if (started) result += separator;
      result += (value as unknown as string)?.toString() ?? "";
      if (!started) started = true;
    }
    return result;
  }

  /**
   * Creates and returns a new string concatenating all of the values in the Vector,
   * converted to strings using their toString methods and separated by commas.
   */
  toString(): string {
    return this.join();
  }

  /**
   * Creates and returns a new string concatenating all of the values in the Vector,
   * converted to strings using their toLocaleString methods and
   * separated by a locale-specific string.
   */
  toLocaleString(): string {
    return this.toArray().toLocaleString();
  }

  /**
   * Returns a shallow copy of a portion of the vector into a new vector.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   * For example, `vector.slice(-2)` would return a new vector
   * containing the last 2 values.
   */
  slice(start = 0, end?: number): Vector<T> {
    const vector: Vector<T> = new Vector();

    start = positiveIndex(this.length, start);
    end = positiveIndex(this.length, end ?? this.length);
    if (start >= end) return vector;
    start = (this.start + start) % this.capacity;
    end = (this.start + end) % this.capacity;

    vector.data = (end > start ? this.data.slice(start, end) : (this.data
      .slice(start, this.capacity)
      .concat(this.data.slice(0, end)))) as T[];
    vector._length = vector.data.length;
    vector._capacity = vector._length;
    vector.end = vector._length - 1;
    return vector;
  }

  /**
   * Changes the contents of an array in place by removing or replacing existing elements
   * or inserting new values. Then returns an Vector of the values that were removed.
   * Returns a shallow copy of a portion of the vector into a new vector.
   * The start represents the index of value you may insert values before
   * or delete values starting from.
   * The deleteCount is the number of values you would like to delete from the vector.
   * The deleteCount would default to the number of values between the index and the end of the vector.
   * If the start value is negative, it will be subtracted from the end of the vector.
   * If the deleteCount is less than 0, no values will be deleted.
   * If any insert values are specified, they will be inserted before the start index.
   */
  splice(start: number, deleteCount?: number): Vector<T>;
  splice(
    start: number,
    deleteCount: number,
    ...insertValues: (T | undefined)[]
  ): Vector<T>;
  splice(
    start: number,
    deleteCount?: number,
    ...insertValues: (T | undefined)[]
  ): Vector<T> {
    start = positiveIndex(this.length, start);
    deleteCount = deleteCount ?? (this.length - start);
    if (deleteCount < 0) deleteCount = 0;
    let end: number = start + deleteCount;
    if (end > this.length) end = this.length;
    const removed: Vector<T> = this.slice(start, end);
    let offset = start - end + insertValues.length;
    const before = start;
    const after = this.length - end;
    if (offset) {
      if (offset > 0) {
        this.length += offset;
        if (before < after) {
          this.start -= offset;
          this.end -= offset;
          if (this.start < 0) this.start += this.capacity;
          if (this.end < 0) this.end += this.capacity;
          for (let i = 0; i < before; i++) {
            this.set(i, this.get(i + offset));
          }
        } else {
          for (let i = 1; i <= after; i++) {
            const index = this.length - i;
            this.set(index, this.get(index - offset));
          }
        }
      } else {
        offset *= -1;
        if (before < after) {
          start += offset;
          for (let i = 1; i <= before; i++) {
            const index = start - i;
            this.set(index, this.get(index - offset));
          }
          this.start += offset;
          this.end += offset;
          if (this.start < 0) this.start += this.capacity;
          if (this.end < 0) this.end += this.capacity;
        } else {
          end -= offset;
          for (let i = 0; i < after; i++) {
            const index = end + i;
            this.set(index, this.get(index + offset));
          }
        }
        this.length -= offset;
      }
    }
    for (let i = 0; i < insertValues.length; i++) {
      this.set(start + i, insertValues[i]);
    }
    return removed;
  }

  /**
   * Reverses the vector in place then returns it.
   */
  reverse(): Vector<T> {
    const mid: number = Math.floor(this.length / 2);
    for (let i = 0; i < mid; i++) {
      const temp: T | undefined = this.get(i);
      const j: number = this.length - i - 1;
      this.set(i, this.get(j));
      this.set(j, temp);
    }
    return this;
  }

  /**
   * Executes the provided function once for each value in the vector.
   * Optionally, you can iterate a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  forEach(
    callback: (value: T | undefined, index: number, vector: Vector<T>) => void,
    start?: number,
    end?: number,
  ): void;
  forEach<U>(
    callback: (value: T | undefined, index: number, vector: Vector<T>) => void,
    thisArg?: U,
    start?: number,
    end?: number,
  ): void;
  forEach<U>(
    callback: (value: T | undefined, index: number, vector: Vector<T>) => void,
    thisArg?: U,
    start?: number,
    end?: number,
  ): void {
    if (typeof thisArg === "number") {
      end = start;
      start = thisArg;
      thisArg = undefined;
    }
    start = positiveIndex(this.length, start ?? 0);
    end = positiveIndex(this.length, end ?? this.length);
    for (let i = start; i < end; i++) {
      callback.call(thisArg, this.get(i)!, i, this);
    }
  }

  /**
   * Creates a new vector from the results of executing the provided function
   * for each value in the vector.
   * Optionally, you can iterate a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  map<U>(
    callback: mapVector<T, U>,
    start?: number,
    end?: number,
  ): Vector<U>;
  map<U, V>(
    callback: mapVector<T, U>,
    thisArg?: V,
    start?: number,
    end?: number,
  ): Vector<U>;
  map<U, V>(
    callback: mapVector<T, U>,
    thisArg?: V,
    start?: number,
    end?: number,
  ): Vector<U> {
    if (typeof thisArg === "number") {
      end = start;
      start = thisArg;
      thisArg = undefined;
    }
    start = positiveIndex(this.length, start ?? 0);
    end = positiveIndex(this.length, end ?? this.length);
    const result: Vector<U> =
      (start === 0 && end === this.length
        ? Vector.from(this)
        : this.slice(start, end)) as Vector<U>;
    const offset: number = start;
    start = 0;
    end = result.length;
    for (let i = start; i < end; i++) {
      result.set(
        i,
        callback.call(thisArg, this.get(i + offset), i + offset, this),
      );
    }
    return result;
  }

  /**
   * Returns the index of the first value in the vector that satisfies the
   * provided testing function or 1 if it is not found.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  findIndex(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    start?: number,
    end?: number,
  ): number;
  findIndex<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): number;
  findIndex<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): number {
    if (typeof thisArg === "number") {
      end = start;
      start = thisArg;
      thisArg = undefined;
    }
    start = positiveIndex(this.length, start ?? 0);
    end = positiveIndex(this.length, end ?? this.length);
    for (let i = start; i < end; i++) {
      if (callback.call(thisArg, this.get(i)!, i, this)) return i;
    }
    return -1;
  }

  /**
   * Returns the index of the last value in the vector that satisfies the
   * provided testing function or -1 if it is not found.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  findLastIndex(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    start?: number,
    end?: number,
  ): number;
  findLastIndex<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): number;
  findLastIndex<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): number {
    if (typeof thisArg === "number") {
      end = start;
      start = thisArg;
      thisArg = undefined;
    }
    start = positiveIndex(this.length, start ?? 0);
    end = positiveIndex(this.length, end ?? this.length);

    for (let i = end - 1; i >= start; i--) {
      if (callback.call(thisArg, this.get(i)!, i, this)) return i;
    }
    return -1;
  }

  /**
   * Returns the first value in the vector that satisfies the
   * provided testing function or undefined if it is not found.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  find(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    start?: number,
    end?: number,
  ): T | undefined;
  find<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): T | undefined;
  find<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): T | undefined {
    const index: number = this.findIndex(callback, thisArg, start, end);
    return index !== -1 ? this.get(index) : undefined;
  }

  /**
   * Returns the last value in the vector that satisfies the
   * provided testing function or undefined if it is not found.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  findLast(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    start?: number,
    end?: number,
  ): T | undefined;
  findLast<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): T | undefined;
  findLast<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): T | undefined {
    const index: number = this.findLastIndex(callback, thisArg, start, end);
    return index !== -1 ? this.get(index) : undefined;
  }

  /**
   * Returns true if a value in the vector satisfies the
   * provided testing function or false if it is not found.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  some(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    start?: number,
    end?: number,
  ): boolean;
  some<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): boolean;
  some<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): boolean {
    const index: number = this.findIndex(callback, thisArg, start, end);
    return index !== -1;
  }

  /**
   * Returns true if a value in the vector satisfies the
   * provided testing function or false if it is not found.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  every(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    start?: number,
    end?: number,
  ): boolean;
  every<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): boolean;
  every<U>(
    callback: (value: T, index: number, vector: Vector<T>) => unknown,
    thisArg?: U,
    start?: number,
    end?: number,
  ): boolean {
    const index: number = this.findIndex(
      function (this: U, value: T, index: number, vector: Vector<T>) {
        return !callback.call(this, value, index, vector);
      },
      thisArg,
      start,
      end,
    );
    return index === -1;
  }

  /**
   * Returns the first index at which the search value can be found in the vector,
   * or -1 if it is not found. This uses strict equality checks.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  indexOf(searchValue: T, start?: number, end?: number): number {
    return this.findIndex((value: T) => value === searchValue, start, end);
  }

  /**
   * Returns the last index at which the search value can be found in the vector,
   * or -1 if it is not found. This uses strict equality checks.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  lastIndexOf(searchValue: T, start?: number, end?: number): number {
    return this.findLastIndex((value: T) => value === searchValue, start, end);
  }

  /**
   * Returns true if the search value can be found in the vector,
   * or false if it is not found. This uses strict equality checks.
   * Optionally, you can search a subset of the vector by providing an index range.
   * The start and end represent the index of values in the vector.
   * The end is exclusive meaning it will not be included.
   * If the index value is negative, it will be subtracted from the end of the vector.
   */
  includes(searchValue: T, start?: number, end?: number): boolean {
    const index: number = this.indexOf(searchValue, start, end);
    return index !== -1;
  }

  /**
   * Merges two or more iterables together.
   * This does not change existing Iterables, it returns a new Vector.
   */
  concat<U>(...values: (Vector<U> | ConcatArray<U>)[]): Vector<U> {
    const vector: Vector<U> = new Vector();
    vector.data = this.toArray() as unknown as U[];
    vector.data = vector.data.concat
      .apply(
        vector.data,
        values.map((value: Vector<U> | ConcatArray<U>) => {
          return value instanceof Vector ? value.toArray() : value;
        }) as ConcatArray<U>[],
      );
    vector._length = vector.data.length;
    vector._capacity = vector._length;
    vector.end = vector._length - 1;
    return vector;
  }

  /**
   * Sorts the values of the vector in place then returns it.
   * This uses Array sort method internally.
   * If the vector has been shifted it may trigger reallocation before sorting.
   */
  sort(compare?: compare<T>) {
    if (this.start !== 0) {
      this.data = this.toArray();
      this.start = 0;
      this.end = this.length - 1;
    }

    if (compare) this.data.sort(compare);
    else this.data.sort();
    return this;
  }

  /** Removes all values from the vector. */
  clear(): void {
    if (this.length !== 0) {
      this.data = [];
      this.data.length = this.capacity;
      this._length = 0;
    }
    this.start = 0;
    this.end = -1;
  }

  /** Checks if the vector is empty. */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Converts the vector to an array.
   * It's recommended to use this instead of `Array.from` because
   * this method is significantly faster.
   */
  toArray(): T[] {
    return (this.end >= this.start
      ? this.data.slice(this.start, this.end + 1)
      : (this.data
        .slice(this.start, this.capacity)
        .concat(this.data.slice(0, this.end + 1)))) as T[];
  }

  /** Returns an iterator for retrieving and removing values from the vector (from left-to-right). */
  *drain(): IterableIterator<T> {
    while (!this.isEmpty()) {
      yield this.shift() as T;
    }
  }

  /** Returns an iterator for retrieving and removing values from the vector (from right-to-left). */
  *drainRight(): IterableIterator<T> {
    while (!this.isEmpty()) {
      yield this.pop() as T;
    }
  }

  /** Returns an iterator for retrieving values from the vector (from left-to-right). */
  *values(): IterableIterator<T> {
    let offset = 0;
    while (offset < this.length) {
      const idx = (this.start + offset++) % this.capacity;
      yield this.data[idx] as T;
    }
  }

  /** Returns an iterator for retrieving values from the vector (from right-to-left). */
  *valuesRight(): IterableIterator<T> {
    let offset = 0;
    while (offset < this.length) {
      let index = this.end - offset++;
      if (index < 0) index = this.capacity + index;
      yield this.data[index] as T;
    }
  }

  /** Returns an iterator for retrieving values from the vector (from left-to-right). */
  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.values();
  }
}
