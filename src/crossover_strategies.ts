import {
  Chromosome,
  CrossoverStrategyOptions,
  Genotype,
  PopulationTuple,
} from "../types.ts";

import {
  randomNumber as defaultNumberGenerator,
  triangularRandomNumber as defaultTriangularRandomNumber,
  universalNumberGenerator as defaultUniversalRandomNumberGenerator,
} from "./math.ts";

const defaultOptions: CrossoverStrategyOptions = {
  randomNumberGenerator: defaultNumberGenerator,
};

export function singlePoint<T>(
  p1: Chromosome<T>,
  p2: Chromosome<T>,
  options: CrossoverStrategyOptions = defaultOptions,
): PopulationTuple<T> {
  const { randomNumberGenerator = defaultNumberGenerator } = {
    ...defaultOptions,
    ...options,
  };
  const chromosomeOffset = randomNumberGenerator(p1.size - 1);
  return [{
    ...p1,
    genes: [
      ...p1.genes.slice(0, chromosomeOffset),
      ...p2.genes.slice(chromosomeOffset),
    ],
  }, {
    ...p2,
    genes: [
      ...p2.genes.slice(0, chromosomeOffset),
      ...p1.genes.slice(chromosomeOffset),
    ],
  }];
}

// Davis order crossover
// useful for permutation problems with small population
// The resulting population can have chromosome with
// a larger gen size. Make sure this is ok for your problem
// or provide a repairSize
export function orderOne<T>(
  p1: Chromosome<T>,
  p2: Chromosome<T>,
  options: CrossoverStrategyOptions = defaultOptions,
): PopulationTuple<T> {
  const limit = p1.genes.length - 1;
  const { randomNumberGenerator = defaultNumberGenerator } = {
    ...defaultOptions,
    ...options,
  };

  // Generate a random range
  const [i1, i2] = [randomNumberGenerator(limit), randomNumberGenerator(limit)]
    .sort();
  // p2 contributions
  const slice1 = p1.genes.slice(i1, i2);
  const slice1Set = new Set(slice1);
  const p2Contrib = p2.genes.filter((gen) => !slice1Set.has(gen));
  const [head1, tail1] = [p2Contrib.slice(0, i1), p2Contrib.slice(i1)];

  // p1 contributions
  const slice2 = p2.genes.slice(i1, i2);
  const slice2Set = new Set(slice2);
  const p1Contrib = p1.genes.filter((gen) => !slice2Set.has(gen));
  const [head2, tail2] = [p1Contrib.slice(0, i1), p1Contrib.slice(i1)];

  const [c1, c2] = [head1.concat(slice1, tail1), head2.concat(slice2, tail2)];
  return [{
    ...p1,
    genes: [...new Set(c1)],
  }, {
    ...p2,
    genes: [...new Set(c2)],
  }];
}

// Doesn't work on permutations and performs poorly on real valued
// genotypes. More diverse than single_point
// Works best on binary genotypes
export function uniform<T>(
  p1: Chromosome<T>,
  p2: Chromosome<T>,
  options: CrossoverStrategyOptions = {
    universalNumberGenerator: defaultUniversalRandomNumberGenerator,
    crossoverRate: 0.5,
  },
): PopulationTuple<T> {
  const {
    universalNumberGenerator = defaultUniversalRandomNumberGenerator,
    crossoverRate = 0.5,
  } = options;

  const [c1, c2] = p1.genes
    .reduce(([c1, c2], p1gen, i) => {
      if (universalNumberGenerator() < crossoverRate) {
        c1.push(p1gen);
        c2.push(p2.genes[i]);
      } else {
        c1.push(p2.genes[i]);
        c2.push(p1gen);
      }
      return [c1, c2];
    }, [[], []] as Array<Array<T>>);
  return [{
    ...p1,
    genes: c1,
  }, {
    ...p2,
    genes: c2,
  }];
}

// Combine real values without randomness so all chromosome might
// eventually become the same if no other strategy is used to
// prevent premature convergence.
// Useful for floating point solutions like portfolio optimization.
export function wholeArithmetic<T>(
  p1: Chromosome<T>,
  p2: Chromosome<T>,
  options: CrossoverStrategyOptions = {
    crossoverAlpha: 0.9,
  },
): PopulationTuple<T> {
  const {
    crossoverAlpha = 0.9,
  } = options;
  const [c1, c2] = p1.genes
    .reduce(([c1, c2], x, i) => {
      const y = p2.genes[i];
      if (Array.isArray(y) && Array.isArray(x)) {
        const { cc1, cc2 } = x.reduce(
          ({ cc1, cc2 }, xx: number, ii: number) => {
            const yy: number = y[ii];
            cc1.push((xx * crossoverAlpha) + (yy * (1 - crossoverAlpha)));
            cc2.push((xx * (1 - crossoverAlpha)) + (yy * crossoverAlpha));
            return { cc1, cc2 };
          },
          { cc1: [], cc2: [] },
        );
        c1.push(cc1);
        c2.push(cc2);
      } else if (typeof x === "number") {
        // @ts-ignore some crossover functions only work with numeric types so
        c1.push((x * crossoverAlpha) + (y * (1 - crossoverAlpha)));
        // @ts-ignore  generics are restricted to number.
        c2.push((x * (1 - crossoverAlpha)) + (y * crossoverAlpha));
      }
      return [c1, c2];
    }, [[], []] as Array<Array<T>>);

  return [{
    ...p1,
    genes: c1,
  }, {
    ...p2,
    genes: c2,
  }];
}

// Partially matched crossover (PMX).
// Suitable for permutations. Respects the absolute position of genes.
// https://open.metu.edu.tr/bitstream/handle/11511/49201/index.pdf
export function partiallyMatched<T>(
  p1: Chromosome<T>,
  p2: Chromosome<T>,
  options: CrossoverStrategyOptions = defaultOptions,
): PopulationTuple<T> {
  const { triangularRandomNumber = defaultTriangularRandomNumber } = {
    ...defaultOptions,
    ...options,
  };
  const third = Math.floor(p1.genes.length / 3);
  let point1 = Math.round(triangularRandomNumber(1, third, third * 2));
  let point2 = Math.round(
    triangularRandomNumber(third, third * 2, p1.genes.length - 1),
  );
  if (point2 < point1) {
    const point1Copy = point1;
    point1 = point2;
    point2 = point1Copy;
  }
  return [{
    ...p1,
    genes: pmx(p1.genes, p2.genes, point1, point2),
  }, {
    ...p2,
    genes: pmx(p2.genes, p1.genes, point1, point2),
  }];
}

function pmx<T>(
  genotype1: Genotype<T>,
  genotype2: Genotype<T>,
  point1: number,
  point2: number,
) {
  const matching = genotype2.slice(point1, point2);
  const displaced = genotype1.slice(point1, point2);
  const child = genotype1.slice(0, point1).concat(
    matching,
    genotype1.slice(point2),
  );

  const toFind = displaced.filter((item) => !matching.includes(item));
  const toMatch = matching.filter((item) => !displaced.includes(item));
  return toFind.reduce((child, gen, k) => {
    const subject = toMatch[k];
    const idx = genotype1.indexOf(subject);
    child[idx] = gen;
    return child;
  }, child);
}

// Other strategies
// messy single point (doesn't preserve the length of chromosome)
// Cycle: crossover on ordered lists using cycles
// Multi-point: crossover at multiple points.

// TSP crossover paper: https://open.metu.edu.tr/bitstream/handle/11511/49201/index.pdf
// Ordered crossover OX (orderOne orderTwo)
// Edge Recombination Crossover (ER) (best quality)
// Position Based Crossover (POS)
