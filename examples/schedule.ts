import genetic, { Genetic } from "../mod.ts";

const data = {
  creditHours: [3.0, 3.0, 3.0, 4.5, 3.0, 3.0, 3.0, 3.0, 4.5, 1.5],
  difficulties: [8.0, 9.0, 4.0, 3.0, 5.0, 2.0, 4.0, 2.0, 6.0, 1.0],
  usefulness: [8.0, 9.0, 6.0, 2.0, 8.0, 9.0, 1.0, 2.0, 5.0, 1.0],
  interest: [8.0, 8.0, 5.0, 9.0, 7.0, 2.0, 8.0, 2.0, 7.0, 10.0],
  classNames: [
    "Algorithms",
    "Artificial Intelligence",
    "Calculus",
    "Chemistry",
    "Data Structures",
    "Discrete Math",
    "History",
    "Literature",
    "Physics",
    "Volleyball",
  ],
};

const scheduleProblem: Genetic.Problem<number> = {
  getGenotype() {
    return new Promise((resolve) =>
      resolve(
        Array.from({ length: 10 }).map(() => Math.random() > 0.5 ? 1 : 0),
      )
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => {
      const { fitness, creditHours } = chromosome.genes.reduce(
        ({ fitness, creditHours }, selected, idx) => {
          return {
            fitness: fitness +
              selected *
                (data.usefulness[idx] * 0.33 + data.interest[idx] * 0.33 -
                  data.difficulties[idx] * 0.33),
            creditHours: creditHours + (selected * data.creditHours[idx]),
          };
        },
        { fitness: 0, creditHours: 0 },
      );
      resolve(creditHours > 18 ? -9999 : fitness);
    });
  },
  shouldTerminate: (_, generation, temperature) =>
    temperature < 2 || generation > 300,
};

const bestPopulation = await genetic(
  scheduleProblem,
  {
    reinsertionType: "elitist",
  },
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ bestPopulation });
console.log(
  data.classNames.filter((_, i) => bestPopulation.genes[i] === 1).join("\n"),
);
