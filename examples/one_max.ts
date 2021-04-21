// # One Max problem.
// # Maximize the number of ones in a bitstring
// # https://tracer.lcc.uma.es/problems/onemax/onemax.html

import genetic, { Genetic } from "../mod.ts";

const maxFitness = 1000;

const sumGenes = (genes: Genetic.Genotype<number>) =>
  genes.reduce((total, n) => n + total, 0);

const oneMaxProblem: Genetic.Problem<number> = {
  getGenotype() {
    return new Promise((resolve) =>
      resolve(
        Array.from({ length: maxFitness }, () => Math.random() > 0.5 ? 1 : 0),
      )
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => resolve(sumGenes(chromosome.genes)));
  },
  shouldTerminate: ([best], _generation, temperature) =>
    best.fitness >= maxFitness || temperature < 10,
};

const options: Genetic.RunOptions<number> = {
  populationSize: 100,
  mutationRate: 0.5,
  selectionRate: 0.8,
  selectionType: "stochasticUniversalSampling",
  coolingRate: 0.85,
};

const bestPopulation = await genetic(
  oneMaxProblem,
  options,
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ stochasticUniversalSampling: bestPopulation });

const options2: Genetic.RunOptions<number> = {
  populationSize: 100,
  mutationRate: 0.5,
  selectionRate: 0.8,
  selectionType: "rank", // roulette
  coolingRate: 0.85,
};

const bestPopulation2 = await genetic(
  oneMaxProblem,
  options2,
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ rank: bestPopulation2 });

const options3: Genetic.RunOptions<number> = {
  populationSize: 100,
  mutationRate: 0.5,
  selectionRate: 0.3,
  selectionType: "rank", // roulette
  crossoverType: "uniform",
  crossoverRate: 0.5,
  coolingRate: 0.85,
};

const bestPopulation3 = await genetic(
  oneMaxProblem,
  options3,
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ rankUniversalCrossover: bestPopulation3 });
