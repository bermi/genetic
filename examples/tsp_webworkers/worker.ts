// Traveling Salesman Problem
import genetic, { Genetic } from "../../mod.ts";

type City = {
  x: number;
  y: number;
};

const getDistance = (cities: City[], fromIdx: number, toIdx: number) => {
  const cityA = cities[fromIdx];
  const cityB = cities[toIdx];
  return Math.sqrt(
    Math.pow(cityA.x - cityB.x, 2) +
      Math.pow(cityA.y - cityB.y, 2),
  );
};

const randomize = (arr: number[]) =>
  [...arr].sort(() => Math.random() < 0.5 ? 1 : -1);

const getTraveledDistance = (
  cities: City[],
  cityHops: Genetic.Genotype<number>,
): number => {
  let distance = 0;
  for (let i = 0; cityHops.length > i; i++) {
    const current = cityHops[i];
    const nextIdx = cityHops.length === i + 1 ? 0 : i + 1;
    const next = cityHops[nextIdx];
    distance += getDistance(cities, current, next);
  }
  return distance;
};

const getTspProblem = (cities: City[]): Genetic.Problem<number> => ({
  getGenotype() {
    return new Promise((resolve) =>
      resolve(randomize(Array.from({ length: cities.length }).map((_, i) => i)))
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) => {
      resolve(getTraveledDistance(cities, chromosome.genes));
    });
  },
  shouldTerminate: (_, generation, temperature) =>
    (generation >= 100 && temperature <= 0) || generation > 300,
});

interface WebWorkerEvent {
  id: number;
  type: string;
  data: {
    cities: City[];
  };
}
interface WebWorkerResponse {
  data: WebWorkerEvent;
}

self.onmessage = async (e: WebWorkerResponse) => {
  const { id, type, data } = e.data;
  if (type === "solve") {
    const result = await genetic(
      getTspProblem(data.cities),
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
        self.postMessage({
          type: "status",
          id,
          data: message,
        }),
    );
    self.postMessage({
      type: "result",
      id,
      data: result,
    });
  }
};
