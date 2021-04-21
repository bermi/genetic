import {
  Parents,
  Population,
  SelectFn,
  SelectionOptions,
  SelectionResponse,
} from "../types.ts";
import * as strategies from "./selection_strategies.ts";

export const selectStrategies = Object.keys(strategies);

export const defaultOptions: SelectionOptions = {
  selectionType: "elite",
  selectionRate: 0.8,
};

export const select = <T>(
  population: Population<T>,
  options: SelectionOptions | never = defaultOptions,
  temperature = 0,
): SelectionResponse<T> => {
  const selectionOptions: SelectionOptions = { ...defaultOptions, ...options };
  const { selectionType = "elite", selectionRate = 0.8 } = selectionOptions;

  const selectFn: SelectFn<T> = strategies[selectionType];
  // We need to ensure we have an even number of parents
  const selectionOffset = 2 *
    Math.floor((population.length * selectionRate) / 2);
  if (
    typeof selectFn !== "function" ||
    !selectStrategies.includes(selectionType)
  ) {
    throw new Error(
      `options.selectionType ${selectionType} is not a valid select function. Valid function are: ${
        selectStrategies.join(", ")
      }`,
    );
  }
  const parents: Population<T> = selectFn(
    population,
    selectionOffset,
    temperature,
  );
  const parentsSet = new WeakSet(parents);
  const leftovers = population.filter((chromosome) =>
    !parentsSet.has(chromosome)
  );
  return {
    leftovers,
    parents: parents.reduce(
      (parents: Parents<T>, _, idx: number): Parents<T> => {
        if (idx % 2 === 0 && population[idx + 1]) {
          return [...parents, [population[idx], population[idx + 1]]];
        }
        return parents;
      },
      [],
    ),
  };
};
