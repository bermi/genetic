export type SelectionStrategies =
  | "elite"
  | "random"
  | "tournament"
  | "roulette"
  | "stochasticUniversalSampling"
  | "boltzmannSelection"
  | "rank";

export type CrossoverStrategies =
  | "singlePoint"
  | "orderOne"
  | "uniform"
  | "wholeArithmetic"
  | "partiallyMatched";

export type MutationStrategies =
  | "shuffle"
  | "flipAll"
  | "flipSome"
  | "scramble"
  | "scrambleSlice"
  | "gaussian";

export type ReinsertionStrategies =
  | "pure"
  | "elitist";

export type SortDirection = "ASC" | "DESC";

export interface InitializeOptions {
  populationSize: number;
}

export interface EvolveOptions<T>
  extends
    Partial<InitializeOptions>,
    Partial<SelectionOptions>,
    Partial<FitnessFnOptions>,
    Partial<CrossoverOptions<T>>,
    Partial<MutationOptions<T>>,
    Partial<ReinsertionFnOptions<T>> {
  coolingRate?: number;
}

export interface RunOptions<T>
  extends
    Partial<InitializeOptions>,
    Partial<Omit<EvolveOptions<T>, "populationSize">> {
}

export type Genotype<T> = ReadonlyArray<T>;
export type Chromosome<T> = {
  genes: Genotype<T>;
  size: number;
  fitness: number;
  age: number;
};
export type PopulationTuple<T> = [Chromosome<T>, Chromosome<T>];
export type Parents<T> = Array<PopulationTuple<T>>;
export type Population<T> = Array<Chromosome<T>>;
export type GenotypePromise<T> = Promise<Genotype<T>>;
export type ChromosomePromise<T> = Promise<Chromosome<T>>;

export interface GetGenotypeFn<T> {
  (counter: number): GenotypePromise<T>;
}

export type PopulationPromise<T> = Promise<Population<T>>;

export type FitnessScorePromise = Promise<number>;

export interface FitnessFn<T> {
  (genotype: Chromosome<T>): FitnessScorePromise;
}

export interface FitnessFnOptions {
  fitnessSortDirection: SortDirection;
}

export interface SelectFn<T> {
  (
    population: Population<T>,
    selectionOffset: number,
    temperature: number,
  ): Population<T>;
}

export interface CrossoverFn<T> {
  (
    p1: Chromosome<T>,
    p2: Chromosome<T>,
    options?: CrossoverOptions<T>,
  ): PopulationTuple<T>;
}

export interface RepairChromosomeFn<T> {
  (chromosome: Chromosome<T>): Chromosome<T>;
}

export interface SelectionOptions {
  selectionType?: SelectionStrategies;
  selectionRate?: number;
}

export interface SelectionResponse<T> {
  parents: Parents<T>;
  leftovers: Population<T>;
}

export interface ScrambleSizeFn<T> {
  (chromosome: Chromosome<T>): number;
}

export interface MutationOptions<T> extends
  Pick<
    RandomNumberHelpers,
    | "randomNumberGenerator"
    | "universalNumberGenerator"
    | "randomGaussian"
  > {
  mutationRate?: number;
  genMutationRate?: number;
  mutationType?: MutationStrategies;
  mutationFn?: MutationFn<T>;
  scrambleSize?: number | ScrambleSizeFn<T>;
}

export interface MutationFn<T> {
  (chromosome: Chromosome<T>, options?: MutationOptions<T>): Chromosome<T>;
}

interface PopulationSizeLimitFn<T> {
  (population: Population<T>): number;
}

export interface ReinsertionFnOptions<T> {
  reinsertionType?: ReinsertionStrategies;
  survivalRate?: number;
  survivorCount?: number;
  reinsertionFn?: ReinsertionFn<T>;
  fitnessSortDirection?: SortDirection;
  maxPopulation?: number;
  maxPopulationFn?: PopulationSizeLimitFn<T>;
}

export interface ReinsertionFn<T> {
  (
    parents: Population<T>,
    offspring: Population<T>,
    leftover: Population<T>,
    options?: ReinsertionFnOptions<T>,
  ): Population<T>;
}

export interface CrossoverStrategyOptions extends
  Pick<
    RandomNumberHelpers,
    | "randomNumberGenerator"
    | "universalNumberGenerator"
    | "triangularRandomNumber"
  > {
  crossoverRate?: number;
  crossoverAlpha?: number;
}

export interface CrossoverOptions<T> extends CrossoverStrategyOptions {
  crossoverType?: CrossoverStrategies;
  crossoverRepairFn?: RepairChromosomeFn<T>;
}

export interface Logger {
  (message: string): void;
}

export interface TerminateFn<T> {
  (population: Population<T>, generation: number, temperature: number): boolean;
}

export interface Problem<T> {
  getGenotype: GetGenotypeFn<T>;
  fitnessFn: FitnessFn<T>;
  shouldTerminate: TerminateFn<T>;
}

export interface RandomNumberGenerator {
  (max: number): number;
}
export interface UniversalNumberGenerator {
  (): number;
}

export interface TriangularNumberGenerator {
  (biasNumber: number, min: number, max: number): number;
}

export interface GausianNumberGenerator {
  (mean: number, sigma: number): number;
}

export interface RandomNumberHelpers {
  randomNumberGenerator?: RandomNumberGenerator;
  randomGaussian?: GausianNumberGenerator;
  universalNumberGenerator?: UniversalNumberGenerator;
  triangularRandomNumber?: TriangularNumberGenerator;
}
