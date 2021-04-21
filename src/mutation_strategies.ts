import {
  Chromosome,
  Genotype,
  MutationOptions,
  UniversalNumberGenerator,
} from "../types.ts";

import {
  randomGaussian as defaultRandomGaussian,
  randomNumber as defaultNumberGenerator,
  universalNumberGenerator as defaultUniversalRandomNumberGenerator,
} from "./math.ts";

export function shuffle<T>(
  chromosome: Chromosome<T>,
  options: MutationOptions<T> = {
    universalNumberGenerator: defaultUniversalRandomNumberGenerator,
  },
): Chromosome<T> {
  const {
    universalNumberGenerator = defaultUniversalRandomNumberGenerator,
  } = options;
  return {
    ...chromosome,
    genes: [...chromosome.genes].sort(() => 0.5 - universalNumberGenerator()),
  };
}

export function flipAll<T>(
  chromosome: Chromosome<T>,
): Chromosome<T> {
  const gen = chromosome.genes[0];
  const flip = getFlipFunction<T>(gen);
  return { ...chromosome, genes: chromosome.genes.map(flip) };
}

export function flipSome<T>(
  chromosome: Chromosome<T>,
  options: MutationOptions<T> = {
    genMutationRate: 0.5,
    universalNumberGenerator: defaultUniversalRandomNumberGenerator,
  },
): Chromosome<T> {
  const {
    universalNumberGenerator = defaultUniversalRandomNumberGenerator,
    genMutationRate = 0.5,
  } = options;

  const gen = chromosome.genes[0];
  const flip = getFlipFunction<T>(gen);
  const genes: Genotype<T> = chromosome.genes.map((g): T => {
    if (universalNumberGenerator() < genMutationRate) {
      return flip(g);
    }
    return g;
  });
  return {
    ...chromosome,
    genes,
  };
}

export function scramble<T>(
  chromosome: Chromosome<T>,
  options: MutationOptions<T> = {
    universalNumberGenerator: defaultUniversalRandomNumberGenerator,
  },
): Chromosome<T> {
  const {
    universalNumberGenerator = defaultUniversalRandomNumberGenerator,
  } = options;
  return {
    ...chromosome,
    genes: shuffleGenotype(chromosome.genes, universalNumberGenerator),
  };
}

export function scrambleSlice<T>(
  chromosome: Chromosome<T>,
  options: MutationOptions<T> = {
    scrambleSize: Math.floor(chromosome.size / 2),
    randomNumberGenerator: defaultNumberGenerator,
    universalNumberGenerator: defaultUniversalRandomNumberGenerator,
  },
): Chromosome<T> {
  const {
    scrambleSize = Math.floor(chromosome.size / 2),
    randomNumberGenerator = defaultNumberGenerator,
    universalNumberGenerator = defaultUniversalRandomNumberGenerator,
  } = options;
  const size = typeof scrambleSize === "function"
    ? scrambleSize(chromosome)
    : scrambleSize;
  const start = randomNumberGenerator(size - 1);
  const [
    high,
    low,
  ] = ((start + size) >= chromosome.genes.length)
    ? [start - size, start]
    : [start, start + size];
  const head = chromosome.genes.slice(0, low);
  const mid = shuffleGenotype(
    chromosome.genes.slice(low, high + low),
    universalNumberGenerator,
  );
  const tail = chromosome.genes.slice(high + low, chromosome.genes.length);
  return {
    ...chromosome,
    genes: head.concat(mid, tail),
  };
}

// Useful for real-value genotypes, balances diversity and fitness
export function gaussian<T>(
  chromosome: Chromosome<T>,
  options: MutationOptions<T> = {
    genMutationRate: 1,
    randomGaussian: defaultRandomGaussian,
    universalNumberGenerator: defaultUniversalRandomNumberGenerator,
  },
): Chromosome<T> {
  const {
    genMutationRate = 1,
    universalNumberGenerator = defaultUniversalRandomNumberGenerator,
    randomGaussian = defaultRandomGaussian,
  } = options;

  // All genes are numbers
  const mean = chromosome.genes.reduce(
    (sum, g) => sum + (typeof g === "number" ? g : 0),
    0,
  ) /
    chromosome.genes.length;
  const sigma = Math.sqrt(
    chromosome.genes.map((g) =>
      Math.pow((typeof g === "number" ? g : 0) - mean, 2)
    ).reduce((a, b) => a + b) /
      chromosome.genes.length,
  );

  const genes = chromosome.genes.map<T>((g): T => {
    if (
      typeof g === "number" && genMutationRate > universalNumberGenerator()
    ) {
      // @ts-ignore: TS is not capable of
      // detecting that we are handling a number
      // https://github.com/microsoft/TypeScript/issues/2214
      return randomGaussian(mean, sigma);
    }
    return g;
  });
  return {
    ...chromosome,
    genes,
  };
}

// Helper functions

interface FlipFunction<T> {
  (gen: T): T;
}
function ignoreFlip<T>(g: T): T {
  return g;
}

const flipFunctions = {
  bigint(g: bigint) {
    return g ^ 1n;
  },
  number(g: number) {
    return g ^ 1;
  },
  boolean(g: boolean) {
    return !g;
  },
  object<T>(g: T): T {
    if (Array.isArray(g)) {
      const gen = g[0];
      const flip = getFlipFunction<T>(gen);
      // @ts-ignore: Recursive flip. Can't make this work with generics
      return g.map(flip);
    }
    return g;
  },
  string: ignoreFlip,
  symbol: ignoreFlip,
  undefined: ignoreFlip,
  function: ignoreFlip,
};

function getFlipFunction<T>(gen: T): FlipFunction<T> {
  // @ts-ignore: Flip functions only work on bigint, number and booleans
  // Other Types will be just passed through
  return flipFunctions[typeof gen] || ignoreFlip;
}

function shuffleGenotype<T>(
  arr: Genotype<T>,
  rand: UniversalNumberGenerator,
): Genotype<T> {
  return [...arr].sort(() => 0.5 - rand());
}
