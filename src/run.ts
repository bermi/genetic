import { Logger, Problem, RunOptions } from "../types.ts";

import { evolve } from "./evolve.ts";
import { initialize } from "./initialize.ts";
import { defaultOptions as selectOptions } from "./select.ts";
import { defaultOptions as initializeOptions } from "./initialize.ts";

export const defaultOptions = {
  ...initializeOptions,
  ...selectOptions,
};

export const run = async <T>(
  problem: Problem<T>,
  options: RunOptions<T> | never = defaultOptions,
  logUpdate: Logger | null = null,
) => {
  const runOptions = { ...defaultOptions, ...options };
  const { populationSize = initializeOptions.populationSize } = runOptions;
  return evolve(
    await initialize(problem.getGenotype, {
      populationSize,
    }),
    problem,
    0,
    0,
    0,
    runOptions,
    logUpdate,
  );
};
