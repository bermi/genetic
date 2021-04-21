import {
  Chromosome,
  FitnessFn,
  FitnessScorePromise,
  Genotype,
  GetGenotypeFn,
  Population,
  Problem,
} from "../types.ts";
import { assert, assertEquals } from "./deps.ts";
import { evolve } from "./evolve.ts";

import { getChromosomeWithDefaults } from "./chromosome.ts";

const AZ = "abcdefghijklmnopqrstuvwxyz";
const azP = getPopulation(AZ);

function getPopulation(letters: string): Population<string> {
  return letters.split("").map((letter) => ({
    ...getChromosomeWithDefaults({ genes: [letter] }),
    fitness: AZ.indexOf(letter) === 0 ? 99 : AZ.indexOf(letter),
  }));
}

Deno.test("evolve", async () => {
  const sumGenes = (genes: Genotype<number>) =>
    genes.reduce((total, n) => n + total, 0);

  const fitnessFn: FitnessFn<number> = (
    chromosome: Chromosome<number>,
  ): FitnessScorePromise =>
    new Promise((resolve) => resolve(sumGenes(chromosome.genes)));

  const getGenotype: GetGenotypeFn<number> = () =>
    new Promise((resolve) =>
      resolve(Array.from({ length: 5 }, () => Math.random() > 0.5 ? 1 : 0))
    );

  const population = [
    getChromosomeWithDefaults({ genes: [1, 0, 1, 0] }),
    getChromosomeWithDefaults({ genes: [1, 0, 1, 0] }),
    getChromosomeWithDefaults({ genes: [1, 1, 0, 1] }),
    getChromosomeWithDefaults({ genes: [0, 0, 0, 0] }),
  ];

  const problem: Problem<number> = {
    getGenotype,
    fitnessFn,
    shouldTerminate: ([best], _generation, _temperature) => best.fitness === 4,
  };

  const messages: string[] = [];
  const bestPopulation = await evolve(population, problem, 0, 0, 0, {
    selectionType: "elite",
    selectionRate: 1,
    coolingRate: 0.8,
    populationSize: population.length,
  }, (message: string) => messages.push(message));
  assertEquals(bestPopulation.genes, [1, 1, 1, 1]);
  assertEquals(JSON.parse(messages[messages.length - 1]).fitness, 4);
  assert(bestPopulation.age > 1);
});

Deno.test("evolve, maxSize", async () => {
  const fitnessFn: FitnessFn<string> = (
    chromosome: Chromosome<string>,
  ): FitnessScorePromise =>
    new Promise((resolve) =>
      resolve(
        chromosome.genes.reduce((sum, letter) => {
          return sum + AZ.indexOf(letter) === 0 ? 99 : AZ.indexOf(letter);
        }, 0),
      )
    );

  const getGenotype: GetGenotypeFn<string> = () =>
    new Promise((resolve) => resolve(AZ.split("")));

  const problem: Problem<string> = {
    getGenotype,
    fitnessFn,
    shouldTerminate: (_, generation, _temperature) => generation === 10,
  };

  const messages: string[] = [];
  const bestPopulation = await evolve(azP, problem, 0, 0, 0, {
    selectionType: "elite",
    selectionRate: 1,
    coolingRate: 0.8,
    populationSize: 26,
  }, (message: string) => messages.push(message));
  assert(
    messages.join("").indexOf('"population":52') === -1,
    "Population should not grow by default",
  );
  assertEquals(bestPopulation.genes, ["a"]);
});
