# genetic 🧬

A Typescript Genetic Algorithm Framework based on
[Sean Moriarity's](https://github.com/seanmor5)
[Genetic Algorithms in Elixir](https://pragprog.com/titles/smgaelixir/genetic-algorithms-in-elixir/)
book.

For details on how genetic algorithms work and their shortcomings, check
[A review on genetic algorithm: past, present, and
future](https://link.springer.com/article/10.1007/s11042-020-10139-6)

This library is asynchronous and its goal is to allow implementing streaming
populations and dynamic fitness functions for continuous evaluation.

## Development

This project has been built using [deno 🦕](https://deno.land/).

The `Makefile` includes shortcuts to commands that will help you test the
project and run the examples.

## Documentation

Import the main `genetic` async function and type definitions under `Genetic` .

```typescript
import genetic, { Genetic } from "https://deno.land/x/genetic@v1.0.2/mod.ts";
```

State your problem. In this case we'll solve the one max problem (the hello
world of genetic algoritms). Our goal is to maximize the number of ones on a
bitstring.

```typescript
const oneMaxProblem: Genetic.Problem<number> = {
  getGenotype() {
    return new Promise((resolve) =>
      resolve(
        Array.from({ length: 1000 }, () => Math.random() > 0.5 ? 1 : 0),
      )
    );
  },
  fitnessFn(chromosome) {
    return new Promise((resolve) =>
      resolve(chromosome.genes.reduce((total, n) => n + total, 0))
    );
  },
  shouldTerminate: ([best], _generation, _temperature) =>
    best.fitness === maxFitness,
};
```

Specify the options for our genetic algorithm run

```typescript
const options: Genetic.RunOptions<number> = {
  populationSize: 100,
  mutationRate: 0.5,
  selectionRate: 0.8,
  selectionType: "stochasticUniversalSampling",
  coolingRate: 0.85,
};
```

And finally find the best population

```typescript
const bestPopulation = await genetic(
  oneMaxProblem,
  options,
  (message: string) =>
    Deno.stdout.write(new TextEncoder().encode(`\r${message}`)),
);

console.log({ bestPopulation });
```

## Examples

The directory `./examples` contain multiple examples showing how to use this
library.

To run all the examples, call:

```shell
make run-examples
```

## Tests

To run tests call

```shell
make test
```

## License

MIT License

Copyright (c) 2021 Bermi Ferrer

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
