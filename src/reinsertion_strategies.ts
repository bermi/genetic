import {
  Chromosome,
  Population,
  ReinsertionFnOptions,
  SortDirection,
} from "../types.ts";

const fitnessSortDirection: SortDirection = "DESC";
const defaultOptions = {
  fitnessSortDirection,
  survivalRate: 0.2,
  survivorCount: 0,
};

export function pure<T>(
  _parents: Population<T>,
  offspring: Population<T>,
  _leftovers: Population<T>,
  _options: ReinsertionFnOptions<T> = defaultOptions,
): Population<T> {
  return offspring;
}

export function elitist<T>(
  parents: Population<T>,
  offspring: Population<T>,
  leftovers: Population<T>,
  options: ReinsertionFnOptions<T> = defaultOptions,
): Population<T> {
  const {
    fitnessSortDirection = "DESC",
    survivalRate = defaultOptions.survivalRate,
    survivorCount = defaultOptions.survivorCount,
  } = options;
  const old = [...parents, ...leftovers];
  const n = survivorCount > 0
    ? survivorCount
    : Math.floor(old.length * survivalRate);
  const sortFn = fitnessSortDirection === "ASC"
    ? (a: Chromosome<T>, b: Chromosome<T>) => a.fitness - b.fitness
    : (a: Chromosome<T>, b: Chromosome<T>) => b.fitness - a.fitness;
  const survivors = old.sort(sortFn).slice(0, n);
  return offspring.concat(survivors).sort(sortFn);
}
