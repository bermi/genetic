import {
  Chromosome,
  MutationOptions,
  MutationStrategies,
  Population,
} from "../types.ts";
import {
  universalNumberGenerator as defaultUniversalRandomNumberGenerator,
} from "./math.ts";

import * as strategies from "./mutation_strategies.ts";
export const mutationStrategies = Object.keys(strategies);

export const mutation = <T>(
  population: Population<T>,
  options: MutationOptions<T>,
): Population<T> => {
  const mutationOptions: MutationOptions<T> = {
    ...{ mutationType: "shuffle", mutationRate: 0.05 },
    ...options,
  };
  const mutationType: MutationStrategies = mutationOptions.mutationType ||
    "shuffle";
  const mutationFn = mutationOptions.mutationFn ||
    strategies[mutationType];
  const mutationRate = typeof mutationOptions.mutationRate === "number"
    ? mutationOptions.mutationRate
    : 0.05;
  const universalNumberGenerator = defaultUniversalRandomNumberGenerator;

  if (
    typeof mutationFn !== "function" ||
    !mutationStrategies.includes(mutationType)
  ) {
    throw new Error(
      `options.mutationType ${mutationType} is not a valid mutation function. Valid function are: ${
        mutationStrategies.join(", ")
      }`,
    );
  }

  return population.map((chromosome: Chromosome<T>): Chromosome<T> => {
    if (universalNumberGenerator() < mutationRate) {
      return mutationFn(chromosome, mutationOptions);
    }
    return chromosome;
  });
};
