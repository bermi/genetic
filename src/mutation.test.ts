import { Genotype, MutationOptions, Population } from "../types.ts";
import { assert, assertEquals } from "./deps.ts";
import { mutation } from "./mutation.ts";

const genotype: Genotype<number> = Array.from(Array(100).keys());
const genotypeString = genotype.join(",");

const verifyMutations = <T>(
  genotype: Genotype<T>,
  mutationRate = 0.05,
  totalMutations = 1000,
  mutationTolerance = 0.02,
  options: MutationOptions<T> = {
    mutationRate,
    genMutationRate: 1,
    mutationType: "shuffle",
  },
) => {
  const population: Population<T> = Array.from({ length: totalMutations }).map(
    () => ({
      genes: genotype,
      size: 0,
      fitness: 0,
      age: 0,
    }),
  );
  const allMutations = mutation<T>(population, options);
  const nonMutatedCount =
    allMutations.filter((m) => m.genes.join(",") === genotypeString).length;
  const mutatedPercent = nonMutatedCount === 0
    ? 1
    : (totalMutations / nonMutatedCount) - 1;
  return {
    nonMutatedCount,
    mutatedPercent,
    valid: mutatedPercent >= (mutationRate - mutationTolerance) &&
      mutatedPercent <= (mutationRate + mutationTolerance),
  };
};

Deno.test("mutation", () => {
  const result1 = verifyMutations<number>(genotype, 0, 100, 0);
  assertEquals(
    result1,
    {
      mutatedPercent: 0,
      nonMutatedCount: 100,
      valid: true,
    },
  );

  const result2 = verifyMutations<number>(genotype, 0.05, 1000, 0.03);
  assertEquals(
    result2.valid,
    true,
  );
  assert(result2.nonMutatedCount > 900);

  const result3 = verifyMutations<number>(genotype, 0.5, 1000);
  assert(result3.nonMutatedCount > 350);

  const result4 = verifyMutations<number>(genotype, 1, 100, 0, {
    mutationRate: 1,
  });
  assertEquals(
    result4,
    {
      mutatedPercent: 1,
      nonMutatedCount: 0,
      valid: true,
    },
  );

  const result5 = verifyMutations<number>(genotype, 1, 100, 0, {
    mutationRate: 1,
    mutationFn: (gen) => gen,
  });
  assert(result5.mutatedPercent === 0, "should use custom mutationType");
  assert(result5.nonMutatedCount === 100, "should use custom mutationType");
});
