import {
  Chromosome,
  FitnessFn,
  FitnessScorePromise,
  Genotype,
  GetGenotypeFn,
  Problem,
} from "../types.ts";
import { assertEquals } from "./deps.ts";
import { run } from "./run.ts";

Deno.test("run", async () => {
  const sumGenes = (genes: Genotype<number>) =>
    genes.reduce((total, n) => n + total, 0);

  const fitnessFn: FitnessFn<number> = (
    chromosome: Chromosome<number>,
  ): FitnessScorePromise =>
    new Promise((resolve) => resolve(sumGenes(chromosome.genes)));

  const getGenotype: GetGenotypeFn<number> = () =>
    new Promise((resolve) =>
      resolve(Array.from({ length: 4 }, () => Math.random() > 0.5 ? 1 : 0))
    );

  const problem: Problem<number> = {
    getGenotype,
    fitnessFn,
    shouldTerminate: ([best], _generation, _temperature) => best.fitness === 4,
  };

  const messages: string[] = [];
  const bestPopulation = await run(problem, {
    populationSize: 100,
    mutationRate: 0.5,
    selectionType: "elite",
    selectionRate: 1,
    coolingRate: 0.8,
  }, (message) => messages.push(message));
  assertEquals(bestPopulation.genes, [1, 1, 1, 1]);
  assertEquals(JSON.parse(messages[messages.length - 1]).fitness, 4);
});
