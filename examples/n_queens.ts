import genetic, { Genetic } from "../mod.ts";

const getRandomNumber = (min: number, max: number): number =>
  Math.random() * (max - min + 1) + min;

const nQueensProblem: Genetic.Problem<number> = {
  getGenotype() {
    return new Promise((resolve) =>
      resolve(
        Array.from(
          { length: 8 },
          () => Math.floor(getRandomNumber(0, 7)),
        ),
      )
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => {
      const diagonalClashes = chromosome.genes.reduce(
        (clashes, gen, i): number[] => {
          for (let j = 0; j < 7; j++) {
            if (i !== j) {
              const dx = Math.abs(i - j);
              const dy = Math.abs(gen - chromosome.genes[j]);
              clashes.push(dx === dy ? 1 : 0);
            }
          }
          return clashes;
        },
        [0],
      );
      // console.log({diagonalClashes, fitness: (new Set(chromosome.genes)).size - diagonalClashes})
      resolve(
        (new Set(chromosome.genes)).size -
          diagonalClashes.reduce((sum, n) => n + sum, 0),
      );
    });
  },

  shouldTerminate: ([best], generation, _temperature) =>
    best.fitness === 8 || generation > 100,
};

const fixGenes = (genes: Set<number>): Genetic.Genotype<number> => {
  if (genes.size >= 8) {
    return [...genes];
  } else {
    return fixGenes(genes.add(Math.floor(getRandomNumber(0, 7))));
  }
};

const crossoverRepairFn: Genetic.RepairChromosomeFn<number> = (
  chromosome: Genetic.Chromosome<number>,
): Genetic.Chromosome<number> => ({
  ...chromosome,
  genes: fixGenes(new Set(chromosome.genes)),
});

const result1 = await genetic(
  nQueensProblem,
  {
    populationSize: 100,
    crossoverType: "orderOne",
    crossoverRepairFn,
    maxPopulation: 2000,
  },
  (message) => Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log("\norderOne");
console.log({ result1 });
if (result1.genes.length > 8) {
  throw new Error(`orderOne should only return 8 gens`);
}

if (result1.fitness !== 8) {
  throw new Error(`Could not solve the problem!`);
}

const result2 = await genetic(
  nQueensProblem,
  {
    crossoverType: "singlePoint",
    maxPopulation: 2000,
  },
  (message) => Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log("\nsinglePoint");
console.log({ result2 });

if (result2.fitness !== 8) {
  throw new Error(`Could not solve the problem!`);
}
