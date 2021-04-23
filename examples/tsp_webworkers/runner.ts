import Canvas from "https://raw.githubusercontent.com/littledivy/drawille/main/canvas.ts";

const totalWorkers = 8;

const canvasWidth = 400;
const canvasHeight = 200;
const cities = [
  { "x": 124, "y": 56 },
  { "x": 345, "y": 53 },
  { "x": 327, "y": 0 },
  { "x": 216, "y": 76 },
  { "x": 314, "y": 34 },
  { "x": 375, "y": 104 },
  { "x": 85, "y": 8 },
  { "x": 270, "y": 124 },
  { "x": 320, "y": 152 },
  { "x": 164, "y": 196 },
  { "x": 111, "y": 94 },
  { "x": 29, "y": 17 },
  { "x": 21, "y": 184 },
  { "x": 36, "y": 123 },
  { "x": 285, "y": 34 },
  { "x": 143, "y": 110 },
  { "x": 332, "y": 74 },
  { "x": 145, "y": 149 },
  { "x": 349, "y": 199 },
  { "x": 65, "y": 114 },
];

const workerStatus: Record<string,string> = {};
const logStatus = () => {
  Deno.stdout.write(
    new TextEncoder().encode(
      `\rWorker/fitness: ${
        Object.keys(workerStatus).sort().map((id) => {
          const { fitness } = JSON.parse(workerStatus[id]);
          return `${id}/${fitness}`;
        }).join(
          ", ",
        )
      }`,
    ),
  );
};

const concurrentSolver = (id: number) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
      type: "module",
      deno: {
        namespace: true,
      },
    });

    worker.onmessage = (event) => {
      const { type, id, data } = event.data;

      if (type === "status") {
        workerStatus[id] = data;
        logStatus();
      } else if (type === "result") {
        resolve({ workerId: id, result: data });
      }
    };

    worker.onerror = reject;
    worker.postMessage({
      type: "solve",
      data: { cities },
      id,
    });
  });

console.log(`Solving Traveling Salesman Problem between ${cities.length} cities using ${totalWorkers} workers`)

const results: any[] = await Promise.all(
  Array.from({ length: totalWorkers }).map((_, i) => concurrentSolver(i + 1)),
);

console.log(results);

const bestPopulation = results.reduce((best, { result }) => {
  if (best.fitness > result.fitness) {
    return result;
  }
  return best;
}, { fitness: 99999999999 });

console.log({ bestPopulation });

console.log("Painting result....");

// Allow some time for Deno.consoleSize to be available
await new Promise((resolve) => setTimeout(resolve, 100));

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
  `Distance between ${cities.length} cities: `,
  Math.round(bestPopulation.fitness),
);
