import genetic, { Genetic } from "../mod.ts";

const target =
  "It's supercalifragilisticexpialidocious\nEven though the sound of it\nIs something quite atrocious";

const getRandomChar = () =>
  String.fromCharCode(0 + Math.floor(Math.random() * 126));
const getRandomChars = (target: string) =>
  Array.from(
    { length: target.length },
    getRandomChar,
  );

const getMatches = (genes: string[], target: string) => {
  let lettersSoFar = "";
  const head = [];
  for (let i = 0; genes.length > i; i++) {
    lettersSoFar += genes[i];
    const pos = target.indexOf(lettersSoFar);
    if (pos === 0) {
      head.push(genes[i]);
    } else {
      return {
        tail: genes.slice(head.length),
        head,
      };
    }
  }
  return {
    head,
    tail: [],
  };
};

const spellingProblem: Genetic.Problem<string> = {
  getGenotype() {
    return new Promise((resolve) =>
      resolve(
        getRandomChars(target),
      )
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => {
      const { head } = getMatches([...chromosome.genes], target);
      resolve(head.length / target.length);
    });
  },
  shouldTerminate: ([best], _generation, _temperature) => best.fitness === 1,
};

const bestPopulation = await genetic(
  spellingProblem,
  {
    populationSize: 100,
    mutationType: "shuffle",
    // Repair the chromosome to keep the sequence that has been guessed so far
    crossoverRepairFn: (chromosome) => {
      const { head, tail } = getMatches([...chromosome.genes], target);

      return {
        ...chromosome,
        genes: head.concat(
          Array.from({ length: Math.ceil((tail.length * 0.05) + 1) }).map(
            getRandomChar,
          ),
          tail,
        ).slice(0, target.length),
      };
    },

    coolingRate: 0.85,
  },
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ bestPopulation });

console.log(bestPopulation.genes.join(""));
