import { Chromosome } from "../types.ts";

type ChromosomeGenes<T> = Pick<Chromosome<T>, "genes">;

export const getChromosomeWithDefaults = <T>(
  chromosome: ChromosomeGenes<T>,
): Chromosome<T> => ({
  fitness: 0,
  age: 0,
  ...chromosome,
  size: chromosome.genes.length,
});
