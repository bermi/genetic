import {
  Chromosome,
  FitnessFn,
  FitnessScorePromise,
  Genotype,
} from "../types.ts";
import { assertEquals } from "./deps.ts";
import { evaluate } from "./evaluate.ts";
import { getChromosomeWithDefaults } from "./chromosome.ts";

Deno.test("evaluate", async () => {
  const population = [
    getChromosomeWithDefaults({ genes: [0, 1, 1, 1] }),
    getChromosomeWithDefaults({ genes: [1, 0, 0, 0] }),
    getChromosomeWithDefaults({ genes: [1, 1, 1, 1] }),
  ];

  const sumGenes = (genes: Genotype<number>) =>
    genes.reduce((total, n) => n + total, 0);

  const computeFitness: FitnessFn<number> = (
    genotype: Chromosome<number>,
  ): FitnessScorePromise =>
    new Promise((resolve) => resolve(sumGenes(genotype.genes)));

  const solution = await evaluate(population, computeFitness);
  assertEquals(solution, [
    { genes: [1, 1, 1, 1], size: 4, fitness: 4, age: 1 },
    { genes: [0, 1, 1, 1], size: 4, fitness: 3, age: 1 },
    { genes: [1, 0, 0, 0], size: 4, fitness: 1, age: 1 },
  ]);

  const solutionAsc = await evaluate(population, computeFitness, {
    fitnessSortDirection: "ASC",
  });
  assertEquals(
    solutionAsc,
    [
      { genes: [1, 0, 0, 0], size: 4, fitness: 1, age: 1 },
      { genes: [0, 1, 1, 1], size: 4, fitness: 3, age: 1 },
      { genes: [1, 1, 1, 1], size: 4, fitness: 4, age: 1 },
    ],
  );

  const solutionAgeTracking = await evaluate(solutionAsc, computeFitness);
  assertEquals(solutionAgeTracking, [
    { genes: [1, 1, 1, 1], size: 4, fitness: 4, age: 2 },
    { genes: [0, 1, 1, 1], size: 4, fitness: 3, age: 2 },
    { genes: [1, 0, 0, 0], size: 4, fitness: 1, age: 2 },
  ]);
});
