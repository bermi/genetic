// Traveling Salesman Problem
import genetic, { Genetic } from "../mod.ts";
import { randomNumber } from "../src/math.ts";
import Canvas from "https://raw.githubusercontent.com/littledivy/drawille/main/canvas.ts";

const canvasWidth = 400;
const canvasHeight = 200;

type City = {
  x: number;
  y: number;
};

const getRandomCity = (): City => ({
  x: randomNumber(canvasWidth - 1),
  y: randomNumber(canvasHeight - 1),
});

const cities = Array.from({ length: 10 }, getRandomCity);

const getDistance = (fromIdx: number, toIdx: number) => {
  const cityA = cities[fromIdx];
  const cityB = cities[toIdx];
  return Math.sqrt(
    Math.pow(cityA.x - cityB.x, 2) +
      Math.pow(cityA.y - cityB.y, 2),
  );
};

const cityIndexes = Array.from({ length: cities.length }).map((_, i) => i);
const randomize = (arr: number[]) =>
  [...arr].sort(() => Math.random() < 0.5 ? 1 : -1);

const getTraveledDistance = (cityHops: Genetic.Genotype<number>): number => {
  let distance = 0;
  for (let i = 0; cityHops.length > i; i++) {
    const current = cityHops[i];
    const nextIdx = cityHops.length === i + 1 ? 0 : i + 1;
    const next = cityHops[nextIdx];
    distance += getDistance(current, next);
  }
  return distance;
};

const getCities = () => {
  return randomize(cityIndexes);
};

const tspProblem: Genetic.Problem<number> = {
  getGenotype() {
    return new Promise((resolve) => resolve(getCities()));
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => {
      resolve(getTraveledDistance(chromosome.genes));
    });
  },
  shouldTerminate: (_, generation, temperature) =>
    generation >= 100 || temperature <= 2,
};

const bestPopulation = await genetic(
  tspProblem,
  {
    populationSize: 1000,
    mutationRate: 0.07,
    mutationType: "shuffle",
    selectionRate: 0.85,
    selectionType: "elite",
    fitnessSortDirection: "ASC",
    crossoverType: "partiallyMatched",
    coolingRate: 0.7,
  },
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ bestPopulation });

const c = new Canvas(canvasWidth, canvasHeight);
const ctx = c.getContext("2d");

const { x, y } = cities[bestPopulation.genes[0]];
ctx.moveTo(x, y);
bestPopulation.genes.map((cityHop: number, idx: number) => {
  const { x, y } = cities[cityHop];
  const nextIdx = bestPopulation.genes.length === idx + 1 ? 0 : idx + 1;
  const nextHop = bestPopulation.genes[nextIdx];
  const nextCity = cities[nextHop];
  ctx.fillRect(x, y, 2, 2);
  ctx.lineTo(nextCity.x, nextCity.y);
  ctx.stroke();
});

console.log(ctx.toString());
console.log(
  "Distance: ",
  Math.round(getTraveledDistance(bestPopulation.genes)),
);

console.log(JSON.stringify(cities));
