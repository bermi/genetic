import genetic, { Genetic } from "../mod.ts";

const getRandomNumber = (min: number, max: number): number =>
  Math.random() * (max - min + 1) + min;

type ROI = number;
type Risk = number;
type PortfolioInstrument = [ROI, Risk];

const portfolioProblem: Genetic.Problem<PortfolioInstrument> = {
  getGenotype() {
    return new Promise((resolve) =>
      resolve(
        Array.from(
          { length: 10 },
          () => ([getRandomNumber(0, 10), getRandomNumber(0, 10)]),
        ),
      )
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => {
      resolve(chromosome.genes.reduce((profit, [ROI, risk]) => {
        return profit + (2 * ROI) - risk;
      }, 0));
    });
  },
  shouldTerminate: (_population, generation, temperature) =>
    temperature < 8 || generation > 500,
};

const bestPopulation = await genetic(
  portfolioProblem,
  {
    populationSize: 300,
    mutationRate: 0.05,
    mutationType: "gaussian",
    selectionRate: 0.8,
    selectionType: "boltzmannSelection", // roulette
    crossoverType: "singlePoint",
    coolingRate: 0.85,
  },
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ bestPopulation });
