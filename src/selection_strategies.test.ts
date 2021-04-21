import { Population } from "../types.ts";
import { assert, assertEquals } from "./deps.ts";
import {
  boltzmannSelection,
  elite,
  random,
  rank,
  roulette,
  stochasticUniversalSampling,
  tournament,
} from "./selection_strategies.ts";

const getGenotype = (letter: string, fitness = 0) => ({
  genes: [letter],
  size: 0,
  age: 0,
  fitness,
});
const a = getGenotype("a", 3);
const b = getGenotype("b", 2);
const c = getGenotype("c", 1);
const d = getGenotype("d", 0);
const e = getGenotype("e", 6);
const f = getGenotype("f", 5);
const g = getGenotype("g", 4);

const population: Population<string> = [a, b, c, d, e, f, g];

Deno.test("selection strategies: elite", () => {
  assertEquals(elite(population, 2), [a, b]);
});

Deno.test("selection strategies: random", () => {
  const randomSelection = new Set(random(population, 3));
  assertEquals(randomSelection.size, 3);
  const leftovers = population.filter((chromosome) =>
    !randomSelection.has(chromosome)
  );
  assertEquals(randomSelection.size + leftovers.length, population.length);
});

Deno.test("selection strategies: tournament", () => {
  const winners = tournament(population, 5);
  assertEquals(
    winners.reduce((sum: number, chromosome) => sum + chromosome.fitness, 0),
    6 + 5 + 4 + 3 + 2,
  );
});

Deno.test("selection strategies: roulette", () => {
  const winners = roulette(population, 4);
  assert(winners.length === (new Set(winners)).size);
  assert(
    winners.reduce((sum, chromosome) => sum + chromosome.fitness, 0) >
      5 + 4,
  );
});

Deno.test("selection strategies: stochasticUniversalSampling", () => {
  const winners = stochasticUniversalSampling(population, 4);
  assert(
    winners.reduce((sum, chromosome) => sum + chromosome.fitness, 0) >
      10,
  );
});

Deno.test("selection strategies: boltzmannSelection", () => {
  const winners = boltzmannSelection(population, 4, 1);
  // Lower temperatures force higher fitness
  assert(
    winners.reduce((sum, chromosome) => sum + chromosome.fitness, 0) >
      6 + 5,
  );
  const winners2 = boltzmannSelection(population, 4, 1000);
  // Higher temperatures force exploring lower fitness
  assert(
    winners2.filter(({ fitness }) => fitness <= 4).length > 0,
  );
});

Deno.test("selection strategies: rank", () => {
  const winners = rank(population, 4);
  assert(winners.length === (new Set(winners)).size);
  assert(
    winners.reduce((sum, chromosome) => sum + chromosome.fitness, 0) >
      4,
  );
});
