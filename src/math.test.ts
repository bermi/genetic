import { assert, assertEquals, Stub, stub } from "./deps.ts";
import {
  randomGaussian,
  randomNumber,
  triangularRandomNumber,
  universalNumberGenerator,
} from "./math.ts";
// import { plot } from "https://deno.land/x/chart/mod.ts";

Deno.test("math: randomGaussian", () => {
  const results = Array.from({ length: 200 }).map(() => randomGaussian(2, 3));
  const average = results.reduce((sum, n) => sum + n, 0) / results.length;
  // console.log({ average }, plot(results, { colors: ["cyan"] }));
  assert(average > 1.2);
  assert(average < 2.8);
});

Deno.test("math: universalNumberGenerator", () => {
  const random: Stub<Math> = stub(Math, "random");
  random.returns = [0.12345];
  assertEquals(universalNumberGenerator(), 0.12345);
  random.restore();
});

Deno.test("math: randomNumber", () => {
  const random: Stub<Math> = stub(Math, "random");
  random.returns = [0.5123];
  assertEquals(randomNumber(10), 5);
  random.restore();
});

Deno.test("math: triangularRandomNumber", () => {
  const results = Array.from({ length: 2000 }).map(() =>
    triangularRandomNumber(10, 5, 20)
  );
  const intSet = [...new Set(results.map(Math.floor))];
  const average = results.reduce((sum, n) => sum + n, 0) / results.length;
  assertEquals(intSet.length, 15);
  assertEquals(Math.floor(average), 10);
});
