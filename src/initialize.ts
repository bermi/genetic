import {
  GetGenotypeFn,
  InitializeOptions,
  PopulationPromise,
} from "../types.ts";

import { getChromosomeWithDefaults } from "./chromosome.ts";

export const defaultOptions: InitializeOptions = { populationSize: 100 };

export const initialize = <T>(
  getGenotype: GetGenotypeFn<T>,
  options: InitializeOptions = defaultOptions,
): PopulationPromise<T> => {
  const { populationSize = 100 } = options;
  return Promise.all(
    Array.from({ length: populationSize })
      .map(async (_, idx: number) => ({
        ...getChromosomeWithDefaults({ genes: await getGenotype(idx) }),
      })),
  );
};
