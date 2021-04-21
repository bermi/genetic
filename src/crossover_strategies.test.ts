import { Chromosome } from "../types.ts";
import { assertEquals } from "./deps.ts";
import {
  orderOne,
  partiallyMatched,
  singlePoint,
  uniform,
  wholeArithmetic,
} from "./crossover_strategies.ts";
import { getChromosomeWithDefaults } from "./chromosome.ts";

Deno.test("crossover strategy: singlePoint", () => {
  const p1 = getChromosomeWithDefaults({ genes: [1, 2, 3, 4] });
  const p2 = getChromosomeWithDefaults({ genes: [5, 6, 7, 8] });
  const p3 = getChromosomeWithDefaults({ genes: [9, 10, 11, 12] });
  const p4 = getChromosomeWithDefaults({ genes: [13, 14, 15, 16] });

  assertEquals(
    singlePoint(p1, p2, { randomNumberGenerator: () => 0 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[5, 6, 7, 8], [1, 2, 3, 4]],
  );

  assertEquals(
    singlePoint(p3, p4, { randomNumberGenerator: () => 0 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[13, 14, 15, 16], [9, 10, 11, 12]],
  );

  assertEquals(
    singlePoint(p1, p2, { randomNumberGenerator: () => 1 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[1, 6, 7, 8], [5, 2, 3, 4]],
  );

  assertEquals(
    singlePoint(p3, p4, { randomNumberGenerator: () => 1 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[9, 14, 15, 16], [13, 10, 11, 12]],
  );

  assertEquals(
    singlePoint(p1, p2, { randomNumberGenerator: () => 4 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[1, 2, 3, 4], [5, 6, 7, 8]],
  );

  assertEquals(
    singlePoint(p3, p4, { randomNumberGenerator: () => 4 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[
      9,
      10,
      11,
      12,
    ], [13, 14, 15, 16]],
  );
});

Deno.test("crossover strategy: orderOne", () => {
  const p1 = getChromosomeWithDefaults({ genes: [1, 2, 3, 4] });
  const p2 = getChromosomeWithDefaults({ genes: [5, 6, 3, 4] });

  let randNumbers = [0, 0];
  const randomNumberGenerator = () => (randNumbers.pop() || 0);
  const run = () =>
    orderOne(p1, p2, { randomNumberGenerator }).map((
      { genes }: Chromosome<number>,
    ) => genes);

  randNumbers = [2, 1];
  assertEquals(
    run(),
    [[5, 2, 6, 3, 4], [1, 6, 2, 3, 4]],
  );

  // randNumbers = [0, 3];
  // console.log(run())

  randNumbers = [0, 3];
  assertEquals(
    run(),
    [[1, 2, 3, 5, 6, 4], [5, 6, 3, 1, 2, 4]],
  );
});

Deno.test("crossover strategy: uniform", () => {
  const p1 = getChromosomeWithDefaults({ genes: [1, 2, 3, 4] });
  const p2 = getChromosomeWithDefaults({ genes: [5, 6, 7, 8] });

  const run = (randomNumber: number, crossoverRate: number) =>
    uniform(p1, p2, {
      universalNumberGenerator: () => randomNumber,
      crossoverRate,
    }).map(
      (
        { genes }: Chromosome<number>,
      ) => genes,
    );

  // console.log(uniform(p1, p2))

  assertEquals(
    run(0.5, 0.5),
    JSON.parse("[[5,6,7,8],[1,2,3,4]]"),
  );

  assertEquals(
    run(0.5, 1),
    JSON.parse("[[1,2,3,4],[5,6,7,8]]"),
  );
});

Deno.test("crossover strategy: wholeArithmetic", () => {
  const p1 = getChromosomeWithDefaults({ genes: [1, 2, 3] });
  const p2 = getChromosomeWithDefaults({ genes: [4, 5, 6] });

  const run = (crossoverAlpha: number) =>
    JSON.stringify(
      wholeArithmetic(p1, p2, { crossoverAlpha }).map(
        (
          { genes }: Chromosome<number>,
        ) => genes.map((g) => +(g).toFixed(6)),
      ),
    );

  assertEquals(
    run(0.5),
    "[[2.5,3.5,4.5],[2.5,3.5,4.5]]",
  );

  assertEquals(
    run(0.9),
    "[[1.3,2.3,3.3],[3.7,4.7,5.7]]",
  );
});

Deno.test("crossover strategy: wholeArithmetic array types", () => {
  const p1 = getChromosomeWithDefaults({ genes: [[1, 2], [3, 4]] });
  const p2 = getChromosomeWithDefaults({ genes: [[5, 6], [7, 8]] });

  const run = (crossoverAlpha: number) =>
    JSON.stringify(
      wholeArithmetic(p1, p2, { crossoverAlpha }).map(
        (
          { genes }: Chromosome<number[]>,
        ) => genes.map((g) => g.map((gg) => +(gg).toFixed(6))),
      ),
    );

  assertEquals(
    run(0.5),
    "[[[3,4],[5,6]],[[3,4],[5,6]]]",
  );

  assertEquals(
    run(0.9),
    "[[[1.4,2.4],[3.4,4.4]],[[4.6,5.6],[6.6,7.6]]]",
  );
});

Deno.test("crossover strategy: partiallyMatched", () => {
  const p1 = getChromosomeWithDefaults({ genes: [1, 2, 3, 4, 5, 6, 7, 8, 9] });
  const p2 = getChromosomeWithDefaults({
    genes: [5, 6, 7, 8, 9, 1, 2, 3, 4],
  });

  const run = (randomNumbers: number[]) =>
    partiallyMatched(p1, p2, {
      triangularRandomNumber: () => randomNumbers.shift() || 0,
    }).map(({ genes }) => genes);

  const test1 = run([1, 3]);
  assertEquals(
    test1,
    JSON.parse("[[1,6,7,4,5,2,3,8,9],[5,2,3,8,9,1,6,7,4]]"),
  );
  assertEquals(test1.map((l) => ([...new Set(l)].length)), [9, 9]);

  const test2 = run([3, 4]);
  assertEquals(
    test2,
    JSON.parse("[[1,2,3,8,5,6,7,4,9],[5,6,7,4,9,1,2,3,8]]"),
  );
  assertEquals(test2.map((l) => ([...new Set(l)].length)), [9, 9]);

  const test3 = run([6, 2]);
  assertEquals(
    test3,
    JSON.parse("[[6,2,7,8,9,1,3,4,5],[9,1,3,4,5,6,2,7,8]]"),
  );
  assertEquals(test3.map((l) => ([...new Set(l)].length)), [9, 9]);
});
