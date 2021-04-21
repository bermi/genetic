import { Chromosome, Population } from "../types.ts";
import { universalNumberGenerator } from "./math.ts";

export function elite<T>(
  population: Population<T>,
  selectionOffset: number,
): Population<T> {
  return population.slice(0, selectionOffset);
}

export function random<T>(
  population: Population<T>,
  selectionOffset: number,
): Population<T> {
  return population.sort(() =>
    universalNumberGenerator() - universalNumberGenerator()
  ).slice(
    0,
    selectionOffset,
  );
}

export function tournament<T>(
  population: Population<T>,
  selectionOffset: number,
  temperature = 0,
  winners: Population<T> = [],
): Population<T> {
  const tournamentSize = Math.ceil(population.length / 3);
  const contestants = random(
    population.filter((chromosome) => !winners.includes(chromosome)),
    tournamentSize,
  );
  const winner = contestants.reduce((best, chromosome) => {
    return best.fitness > chromosome.fitness ? best : chromosome;
  }, contestants[0]);
  winners.push(winner);
  if (winners.length === selectionOffset) {
    return winners;
  }
  return tournament(population, selectionOffset, temperature, winners);
}

// Roulette-wheel selection via stochastic acceptance.
// Details on http://arxiv.org/abs/1109.3627
// https://en.wikipedia.org/wiki/Fitness_proportionate_selection
export function roulette<T>(
  population: Population<T>,
  selectionOffset: number,
): Population<T> {
  const winners: Population<T> = [];
  let populationFitness = sumFitness(population);
  const totalContestants = population.length;
  const pastWinners = new Set();
  while (winners.length !== selectionOffset) {
    let winner;
    while (!winner) {
      const idx = Math.floor(totalContestants * universalNumberGenerator());
      if (
        !pastWinners.has(idx) &&
        universalNumberGenerator() < population[idx].fitness / populationFitness
      ) {
        winner = population[idx];
        populationFitness -= winner.fitness;
        winners.push(winner);
        pastWinners.add(idx);
      }
    }
  }
  return winners;
}

// Stochastic universal sampling: selection at evenly spaced intervals.
export function stochasticUniversalSampling<T>(
  population: Population<T>,
  selectionOffset: number,
): Population<T> {
  const populationFitness = sumFitness(population);
  const intervalSpace = populationFitness / selectionOffset;
  const startInterval = universalNumberGenerator() * intervalSpace;
  const populationSize = population.length;

  const pointers = Array.from({ length: selectionOffset }).map((_, i) =>
    startInterval + i * intervalSpace
  );
  return pointers.map((pointer) => {
    let keep;
    let sum = 0;
    while (!keep) {
      for (let i = 0; populationSize > i && !keep; i = i + 1) {
        if (population[i].fitness + sum >= pointer) {
          keep = population[i];
        } else {
          sum = population[i].fitness + sum;
        }
      }
      if (!keep) {
        throw Error("No candidate to keep was found");
      }
    }
    return keep;
  });
}

export function boltzmannSelection<T>(
  population: Population<T>,
  selectionOffset: number,
  temperature: number,
): Population<T> {
  const pastWinners = new Set();
  return Array.from({ length: selectionOffset }).map(() => {
    let sum = 0;
    const probability = [];
    for (let i = 0; i < population.length; ++i) {
      sum += Math.exp(population[i].fitness / temperature);
      probability.push(sum);
    }
    // Normalize to track cummulative distribution
    for (let i = 0; i < probability.length; ++i) {
      probability[i] = probability[i] / sum;
    }
    let winner = -1;
    while (winner < 0) {
      let index = binarySearch(universalNumberGenerator(), probability);
      if (index < 0) {
        index = Math.abs(-(index + 1));
      }
      if (!pastWinners.has(index)) {
        winner = index;
        pastWinners.add(winner);
      }
    }
    return population[winner];
  });
}

export function rank<T>(
  population: Population<T>,
  selectionOffset: number,
): Population<T> {
  const winners: Population<T> = [];
  const rankedPopulation = [...population].sort(
    (a: Chromosome<T>, b: Chromosome<T>) => a.fitness - b.fitness,
  );
  let rankSum = rankedPopulation.reduce((sum, _, idx) => sum + idx, 1);
  const totalContestants = population.length;
  const pastWinners = new Set();
  while (winners.length !== selectionOffset) {
    let winner;
    while (!winner) {
      const idx = Math.floor(totalContestants * universalNumberGenerator());
      if (
        !pastWinners.has(idx) &&
        universalNumberGenerator() < idx + 1 / rankSum
      ) {
        winner = population[idx];
        rankSum -= idx + 1;
        winners.push(winner);
        pastWinners.add(idx);
      }
    }
  }
  return winners;
}

// TODO:
// Add Lexicase Selection for Regression: https://arxiv.org/pdf/1907.04736.pdf
// https://push-language.hampshire.edu/t/lexicase-selection/90/3
// Returns an individual that does the best on the fitness cases
// when considered one at a time in random order.
// export function lexicaseSelection<T>(
//   population: Population<T>,
//   selectionOffset: number,
// ): Population<T> {
//   }
// }
// Data: cases := list of training cases in random order,
//   candidates := population of classifiers
// Parameters :batch size, fitness threshold
// Result: Return a individual to be used as a parent
// batches := create batches from the cases of a given batch size;
// while True do
//   batch-sample := first batch from batches;
//   candidates := candidates with the fitness (number of
//   corrects/ number of matches) > fitness threshold in the
//   batch-sample;
//   if only one candidate exists in candidates then
//     parent = candidate;
//     return parent;
//   end
//   delete batch-sample from batches;
//   if batches is empty then
//     parent = a randomly selected candidate from
//     candidates;
//   return parent;
//   end
// end

function binarySearch(target: number, data: Array<number>) {
  let low = 0;
  let high = data.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = data[mid];
    if (value < target) {
      low = mid + 1;
    } else if (value > target) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  // returns (-(insertion point) - 1) if the key isn't found
  return -(low + 1);
}

function sumFitness<T>(population: Population<T>): number {
  return population.reduce(
    (total, { fitness }) => total + fitness,
    0,
  );
}
