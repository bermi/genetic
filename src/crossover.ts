import {
  CrossoverFn,
  CrossoverOptions,
  Parents,
  Population,
  PopulationTuple,
  RepairChromosomeFn,
} from "../types.ts";
import { randomNumber as randomNumberGenerator } from "./math.ts";
import * as strategies from "./crossover_strategies.ts";

export const crossoverStrategies = Object.keys(strategies);

function getDefaultOptions<T>(): CrossoverOptions<T> {
  return {
    crossoverType: "singlePoint",
    randomNumberGenerator,
  };
}

export const crossover = <T>(
  parents: Parents<T>,
  options: CrossoverOptions<T> | never = getDefaultOptions<T>(),
): Population<T> => {
  const crossoverOptions: CrossoverOptions<T> = {
    ...getDefaultOptions<T>(),
    ...options,
  };
  const crossoverType = crossoverOptions.crossoverType || "singlePoint";
  const crossoverFn: CrossoverFn<T> = strategies[crossoverType];
  if (
    typeof crossoverFn !== "function" ||
    !crossoverStrategies.includes(crossoverType)
  ) {
    throw new Error(
      `options.crossoverType ${crossoverType} is not a valid crossover function. Valid function are: ${
        crossoverStrategies.join(", ")
      }`,
    );
  }

  const { crossoverRepairFn = false } = crossoverOptions;
  return parents.reduce(
    (population: Population<T>, parents: PopulationTuple<T>): Population<T> => {
      const [p1, p2] = parents;
      let children = crossoverFn(p1, p2, crossoverOptions);
      if (crossoverRepairFn) {
        children = repairOffspring(children, crossoverRepairFn);
      }
      return population.concat(children);
    },
    [],
  );
};

function repairOffspring<T>(
  children: PopulationTuple<T>,
  crossoverRepairFn: RepairChromosomeFn<T>,
): PopulationTuple<T> {
  const [p1, p2] = children;
  return [crossoverRepairFn(p1), crossoverRepairFn(p2)];
}
