import {
  GausianNumberGenerator,
  RandomNumberGenerator,
  UniversalNumberGenerator,
} from "../types.ts";

export const universalNumberGenerator: UniversalNumberGenerator =
  // We'll re-export Math.random directly in order to allow stubs
  () => Math.random();

export const randomNumber: RandomNumberGenerator = (max) =>
  Math.floor(Math.random() * (max + 1));

/**
* Returns a random number distributed according to the normal distribution with
 * the provided mean and sigma/standardDeviation
 */
export const randomGaussian: GausianNumberGenerator = (
  mean: number,
  standardDeviation: number,
): number => {
  // From Knuth v2, 3rd ed, p122
  let w = 0;
  let x1 = 0;
  while (!(w < 1 && w > 0)) {
    x1 = 2 * Math.random() - 1;
    const x2 = 2 * Math.random() - 1;
    w = x1 * x1 + x2 * x2;
  }
  return mean + standardDeviation * x1 * Math.sqrt(-2 * Math.log(w) / w);
};

export const triangularRandomNumber = (
  biasNumber: number,
  min: number,
  max: number,
) => {
  const n = Math.random();
  const rate = 1 / biasNumber;
  const rand = n < rate
    ? Math.sqrt(n * rate)
    : (1 - Math.sqrt((1 - n) * (1 - rate)));
  return rand * (max - min) + min;
};
