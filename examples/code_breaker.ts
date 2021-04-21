import { jaroWinkler } from "https://github.com/kwunshing123/jaro-winkler-typescript/raw/v1.0.1/src/index.ts";
import genetic, { Genetic } from "../mod.ts";

const target = "ILoveGeneticAlgorithms";
const targetChars = to64BitArray(target);
const encrypted = "LIjs`B`k`qlfDibjwlqmhv";
const encryptedChars = to64BitArray(encrypted);

const codeBreakingProblem: Genetic.Problem<number> = {
  getGenotype() {
    return new Promise((resolve) =>
      resolve(
        Array.from({ length: 64 }).map(() => Math.random() > 0.5 ? 1 : 0),
      )
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => {
      // @ts-ignore: BigInt supports a second parameter on deno
      const key = BigInt(`0b${chromosome.genes.join("")}`);
      const guess = encryptDecrypt(encryptedChars, key);
      resolve(jaroWinkler(target, guess));
    });
  },
  shouldTerminate: ([best]) => best.fitness === 1,
};

const bestPopulation = await genetic(
  codeBreakingProblem,
  {
    populationSize: 100,
    mutationRate: 0.5,
    maxPopulation: 2000,
  },
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

const key = BigInt(`0b${bestPopulation.genes.join("")}`).toString();
console.log("The key is:");
console.log(key);

console.log({
  encrypted: encryptDecrypt(targetChars, BigInt(key)),
  decrypted: encryptDecrypt(
    to64BitArray(encryptDecrypt(targetChars, BigInt(key))),
    BigInt(key),
  ),
});

function encryptDecrypt(word: BigInt[], key: BigInt) {
  return word.map((c) =>
    String.fromCharCode(Number((BigInt(c) ^ BigInt(key)) % 32768n))
  ).join(
    "",
  );
}

function to64BitArray(string: string) {
  return string.split("").map((c) => BigInt(c.charCodeAt(0)));
}
