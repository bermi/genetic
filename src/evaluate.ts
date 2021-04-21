import {
  Chromosome,
  FitnessFn,
  FitnessFnOptions,
  Population,
  PopulationPromise,
} from "../types.ts";

export const evaluate = async <T>(
  population: Population<T>,
  computeFitnessFn: FitnessFn<T>,
  options: FitnessFnOptions = {
    fitnessSortDirection: "DESC",
  },
): PopulationPromise<T> =>
  (await Promise.all(
    population.map(
      async (
        chomosome: Chromosome<T>,
      ): Promise<Chromosome<T>> => {
        const fitness = await computeFitnessFn(chomosome);
        const age = chomosome.age + 1;
        return { ...chomosome, fitness, age };
      },
    ),
  )).sort(
    options.fitnessSortDirection === "ASC"
      ? (a: Chromosome<T>, b: Chromosome<T>) => a.fitness - b.fitness
      : (a: Chromosome<T>, b: Chromosome<T>) => b.fitness - a.fitness,
  );
