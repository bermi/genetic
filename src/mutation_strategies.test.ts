import { assert, assertEquals } from "./deps.ts";
import {
  flipAll,
  flipSome,
  gaussian,
  scramble,
  scrambleSlice,
} from "./mutation_strategies.ts";
import { getChromosomeWithDefaults } from "./chromosome.ts";
import {
  Chromosome,
  RandomNumberGenerator,
  UniversalNumberGenerator,
} from "../types.ts";
// import { plot } from "https://deno.land/x/chart/mod.ts";

let universalRandomNumbers = [0];
const universalNumberGenerator: UniversalNumberGenerator = () => {
  const number = universalRandomNumbers.pop();
  return typeof number === "undefined" ? 0 : number;
};
let randomNumbers = [0];
const randomNumberGenerator: RandomNumberGenerator = (_) => {
  const number = randomNumbers.pop();
  return typeof number === "undefined" ? 0 : number;
};

const pBigInt = getChromosomeWithDefaults({ genes: [0n, 1n] });
const pNumber = getChromosomeWithDefaults({ genes: [0, 1] });
const pReal = getChromosomeWithDefaults({
  genes: Array.from({ length: 100 }).map((_, i) =>
    10 * Math.sin(i * ((Math.PI * 4) / 100))
  ),
});
const pBoolean = getChromosomeWithDefaults({ genes: [false, true] });
const pArrNumber = getChromosomeWithDefaults({ genes: [[0, 1], [1, 0]] });
const pArrArrNumber = getChromosomeWithDefaults({ genes: [[[0, 1], [1, 0]]] });
const pStrings = getChromosomeWithDefaults({ genes: ["1", "0", "3"] });
const pAToZ = getChromosomeWithDefaults({
  genes: "abcdefghijklmnopqrstuvwxyz".split(""),
});

Deno.test("mutation strategy: flipAll", () => {
  assertEquals(
    flipAll(pBigInt).genes,
    [1n, 0n],
  );
  assertEquals(
    flipAll(pNumber).genes,
    [1, 0],
  );
  assertEquals(
    flipAll(pBoolean).genes,
    [true, false],
  );
  assertEquals(
    flipAll(pArrNumber).genes,
    [[1, 0], [0, 1]],
  );
  assertEquals(
    flipAll(pArrArrNumber).genes,
    [[[1, 0], [0, 1]]],
  );
  assertEquals(
    flipAll(pStrings).genes,
    ["1", "0", "3"],
  );
});

Deno.test("mutation strategy: flipSome", () => {
  universalRandomNumbers = [1, 0];
  assertEquals(
    flipSome(pBigInt, { universalNumberGenerator, genMutationRate: 1 })
      .genes,
    [1n, 1n],
  );

  universalRandomNumbers = [0.3, 0];
  assertEquals(
    flipSome(pNumber, { universalNumberGenerator, genMutationRate: 0.2 })
      .genes,
    [1, 1],
  );
});

Deno.test("mutation strategy: scramble", () => {
  universalRandomNumbers = [1, 1, 0];
  assertEquals(
    scramble(pStrings, { universalNumberGenerator })
      .genes,
    ["1", "3", "0"],
  );
});

Deno.test("mutation strategy: scrambleSlice", () => {
  universalRandomNumbers = [0, 1, 0, 1, 0, 1, 0, 1];
  randomNumbers = [8];
  assertEquals(
    scrambleSlice(pAToZ, {
      universalNumberGenerator,
      randomNumberGenerator,
      scrambleSize: 5,
    })
      .genes.join(""),
    "abcdefghijklmoqrpnstuvwxyz",
  );

  universalRandomNumbers = [0, 1, 0, 1, 0, 1, 0, 1];
  randomNumbers = [8];
  assertEquals(
    scrambleSlice(pAToZ, {
      universalNumberGenerator,
      randomNumberGenerator,
      scrambleSize: (_chromosome: Chromosome<string>) => 5,
    })
      .genes.join(""),
    "abcdefghijklmoqrpnstuvwxyz",
  );
});

Deno.test("mutation strategy: gaussian", () => {
  // console.log(
  //   plot([pReal.genes, gaussian(pReal).genes.map((g) => g)], {
  //     colors: ["cyan", "magenta"],
  //   }),
  // );
  assert(
    Math.round(gaussian(pReal).genes.reduce((sum, g) => sum + g, 0)) !== 0,
  );
});
