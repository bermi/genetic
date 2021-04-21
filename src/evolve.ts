import {
  ChromosomePromise,
  EvolveOptions,
  Logger,
  Population,
  Problem,
  ReinsertionFnOptions,
} from "../types.ts";

import * as strategies from "./reinsertion_strategies.ts";
export const reinsertionStrategies = Object.keys(strategies);

import { evaluate } from "./evaluate.ts";
import { select } from "./select.ts";
import { crossover } from "./crossover.ts";
import { mutation } from "./mutation.ts";

export const evolve = async <T>(
  population: Population<T>,
  problem: Problem<T>,
  generation = 0,
  lastMaxFitness = 0,
  temperature = 0,
  options: EvolveOptions<T>,
  logUpdate: Logger | null = null,
): ChromosomePromise<T> => {
  const {
    fitnessSortDirection = "DESC",
    coolingRate = 0.8,
    selectionType,
    selectionRate,
  } = options;

  population = await evaluate(
    population,
    problem.fitnessFn,
    { fitnessSortDirection },
  );
  const best = population[0];
  // const fitnessScore = await problem.fitnessFn(best);

  const fitnessSign = fitnessSortDirection === "ASC" ? 1 : -1;

  temperature = coolingRate *
    (temperature + (best.fitness - (lastMaxFitness * fitnessSign)));
  if (logUpdate) {
    await logUpdate(
      `{"population":${population.length},"generation":${generation},"temperature":${
        temperature.toFixed(2)
      },"fitness":${best.fitness.toFixed(4)}}`,
    );
  }

  if (problem.shouldTerminate(population, generation, temperature)) {
    return best;
  }
  const { parents, leftovers } = select(
    population,
    { selectionType, selectionRate },
    temperature,
  );
  const children = crossover(parents, options);
  const mutants = mutation(population, options);
  const offsprings = children.concat(mutants);

  return evolve(
    reinsertion<T>(parents.flat(), offsprings, leftovers, options),
    problem,
    generation + 1,
    best.fitness,
    temperature,
    options,
    logUpdate,
  );
};

function reinsertion<T>(
  parents: Population<T>,
  offsprings: Population<T>,
  leftovers: Population<T>,
  options: EvolveOptions<T>,
) {
  const {
    populationSize = 100,
    reinsertionType = "pure",
    survivalRate = 0.2,
    survivorCount = 0,
    reinsertionFn = strategies[reinsertionType],
    maxPopulationFn,
  } = options;
  const {
    maxPopulation = populationSize,
  } = options;
  const reinsertionOptions: ReinsertionFnOptions<T> = {
    survivalRate,
    survivorCount,
    maxPopulation,
  };

  if (
    typeof reinsertionFn !== "function" ||
    !reinsertionStrategies.includes(reinsertionType)
  ) {
    throw new Error(
      `options.reinsertionType ${reinsertionType} is not a valid reinsertion function. Valid function are: ${
        reinsertionStrategies.join(", ")
      }`,
    );
  }
  let populationSizeLimit = maxPopulation && maxPopulation > 0
    ? maxPopulation
    : 0;

  const newPopulation = reinsertionFn(
    parents,
    offsprings,
    leftovers,
    reinsertionOptions,
  );

  if (typeof maxPopulationFn === "function") {
    populationSizeLimit = maxPopulationFn(newPopulation);
  }
  if (populationSizeLimit > 0) {
    return newPopulation.slice(0, populationSizeLimit);
  }
  return newPopulation;
}
