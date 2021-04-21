// Modification of the knapsack problmen
//
// Truck Bed Weight Limit: 40
//
// We need to optimize cargo load to achieve the highest profit
//
// Cargo:
//
// [:A, weight: 10, profit: 6]
// [:B, weight: 6,  profit: 5]
// [:C, weight: 8,  profit: 8]
// [:D, weight: 7,  profit: 9]
// [:E, weight: 10, profit: 3]
// [:F, weight: 9,  profit: 7]
// [:G, weight: 7,  profit: 3]
// [:H, weight: 11, profit: 1]
// [:I, weight: 6,  profit: 2]
// [:J, weight: 8,  profit: 6]

import genetic, { Genetic } from "../mod.ts";

const profits = [6, 5, 8, 9, 6, 7, 3, 1, 2, 6];
const weights = [10, 6, 8, 7, 10, 9, 7, 11, 6, 8];
const weightLimit = 40;

const cargoProblem: Genetic.Problem<number> = {
  getGenotype() {
    return new Promise((resolve) =>
      resolve(Array.from({ length: 10 }, () => Math.random() > 0.5 ? 1 : 0))
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => {
      const potentialProfit = chromosome.genes.reduce((profit, gen, idx) => {
        return profit + (gen * profits[idx]);
      }, 0);
      const totalWeight = chromosome.genes.reduce((profit, gen, idx) => {
        return profit + (gen * weights[idx]);
      }, 0);
      resolve(totalWeight > weightLimit ? 0 : potentialProfit);
    });
  },
  shouldTerminate: (_, generation, temperature) =>
    generation === 100 || temperature < 25,
};

const bestPopulation = await genetic(
  cargoProblem,
  {
    populationSize: 100,
    mutationRate: 0.5,
    selectionRate: 0.8,
    selectionType: "tournament",
    coolingRate: 0.85,
  },
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ bestPopulation });
