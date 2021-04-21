import { GenotypePromise } from "../types.ts";
import { assertEquals } from "./deps.ts";
import { initialize } from "./initialize.ts";

Deno.test("initialize", async () => {
  const getGenotype = (count: number): GenotypePromise<string> =>
    new Promise((resolve) => {
      resolve([`test${count}`]);
    });

  assertEquals(
    await getGenotype(5),
    ["test5"],
  );
  assertEquals(await initialize(getGenotype, { populationSize: 2 }), [
    { genes: ["test0"], size: 1, fitness: 0, age: 0 },
    { genes: ["test1"], size: 1, fitness: 0, age: 0 },
  ]);
});
