import { Population } from "../types.ts";
import { assertEquals } from "./deps.ts";
import { select } from "./select.ts";

Deno.test("select", () => {
  const getGenotype = (letter: string) => ({
    genes: [letter],
    size: 0,
    age: 0,
    fitness: 0,
  });
  const a = getGenotype("a");
  const b = getGenotype("b");
  const c = getGenotype("c");
  const d = getGenotype("d");

  const population: Population<string> = [a, b, c, d];
  const { parents } = select(population, {
    selectionRate: 1,
    selectionType: "elite",
  });

  assertEquals(
    parents,
    [[a, b], [c, d]],
  );

  const unevenPopulation: Population<string> = [a, b, c];
  const { parents: unevenParents, leftovers } = select(unevenPopulation);
  assertEquals(
    unevenParents,
    [[a, b]],
  );
  assertEquals(leftovers, [c]);
});
