import { assertEquals } from "./deps.ts";
import { elitist, pure } from "./reinsertion_strategies.ts";
import { getChromosomeWithDefaults } from "./chromosome.ts";
import { Chromosome, Population } from "../types.ts";

const AZ = "abcdefghijklmnopqrstuvwxyz";
const AJ = AZ.slice(0, 10);
const KT = AZ.slice(10, 20);
const UZ = AZ.slice(20);

const ajP = getPopulation(AJ);
const ktP = getPopulation(KT);
const uzP = getPopulation(UZ);

Deno.test("reinsertion strategy: pure", () => {
  assertEquals(
    pure(ajP, ktP, uzP).map((g: Chromosome<string>) => g.genes.join("")).join(
      "",
    ),
    KT,
  );
});

Deno.test("reinsertion strategy: elitist", () => {
  assertEquals(
    elitist(ajP, ktP, uzP).map((g: Chromosome<string>) => g.genes.join(""))
      .join(
        "",
      ),
    "azytsrqponmlk",
  );

  assertEquals(
    elitist(ajP, ktP, uzP, {
      fitnessSortDirection: "ASC",
      survivalRate: 0.2,
      survivorCount: 0,
    }).map((g: Chromosome<string>) => g.genes.join("")).join(
      "",
    ),
    "bcdklmnopqrst",
  );

  assertEquals(
    elitist(ajP, ktP, uzP, {
      survivalRate: 0.5,
    }).map((g: Chromosome<string>) => g.genes.join("")).join(
      "",
    ),
    "azyxwvutsrqponmlkj",
  );
});

function getPopulation(letters: string): Population<string> {
  return letters.split("").map((letter) => ({
    ...getChromosomeWithDefaults({ genes: [letter] }),
    fitness: AZ.indexOf(letter) === 0 ? 99 : AZ.indexOf(letter),
  }));
}
