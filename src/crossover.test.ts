import { Chromosome, Parents, RepairChromosomeFn } from "../types.ts";
import { assertEquals } from "./deps.ts";
import { crossover } from "./crossover.ts";
import { getChromosomeWithDefaults } from "./chromosome.ts";

const parents: Parents<number> = [[
  getChromosomeWithDefaults({ genes: [1, 2, 3, 4] }),
  getChromosomeWithDefaults({ genes: [5, 6, 7, 8] }),
], [
  getChromosomeWithDefaults({ genes: [9, 10, 11, 12] }),
  getChromosomeWithDefaults({ genes: [13, 14, 15, 16] }),
]];

Deno.test("crossover", () => {
  assertEquals(
    crossover(parents, { randomNumberGenerator: () => 0 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[5, 6, 7, 8], [1, 2, 3, 4], [13, 14, 15, 16], [
      9,
      10,
      11,
      12,
    ]],
  );

  assertEquals(
    crossover(parents, { randomNumberGenerator: () => 1 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[1, 6, 7, 8], [5, 2, 3, 4], [9, 14, 15, 16], [13, 10, 11, 12]],
  );

  assertEquals(
    crossover(parents, { randomNumberGenerator: () => 4 }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[1, 2, 3, 4], [5, 6, 7, 8], [
      9,
      10,
      11,
      12,
    ], [13, 14, 15, 16]],
  );
});

Deno.test("crossover crossoverRepairFn", () => {
  const crossoverRepairFn: RepairChromosomeFn<number> = (
    chromosome: Chromosome<number>,
  ): Chromosome<number> => ({
    ...chromosome,
    genes: chromosome.genes.map((g) => g + 1).slice(0, 1),
  });
  assertEquals(
    crossover(parents, {
      crossoverRepairFn,
      randomNumberGenerator: () => 0,
    }).map((
      { genes }: Chromosome<number>,
    ) => genes),
    [[6], [2], [14], [
      10,
    ]],
  );
});
