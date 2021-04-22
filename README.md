# genetic 🧬

[`genetic`](https://github.com/bermi/genetic) is a Typescript Genetic Algorithm
Framework based on [Sean Moriarity's](https://github.com/seanmor5)
[Genetic Algorithms in Elixir](https://pragprog.com/titles/smgaelixir/genetic-algorithms-in-elixir/)
book.

For details on how genetic algorithms work and their shortcomings, check
[A review on genetic algorithm: past, present, and
future](https://link.springer.com/article/10.1007/s11042-020-10139-6)

This library is asynchronous, and its goal is to allow the implementation of
streaming populations and dynamic fitness functions for continuous evaluation.

Keep in mind that genetic algorithms will underperform
[carefully designed algorithms](https://www.algorist.com/algorist.html) under
most circumstances. They can be helpful for sporadic exploration when the
problem is poorly understood or of stochastic nature.

## Documentation

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW1JhbmRvbSBQb3B1bGF0aW9uXSAtLT4gQihTZWxlY3QgRml0dGVzdClcbiAgICBCIC0tPiBDKENyb3Nzb3ZlcilcbiAgICBDIC0tPiBEKE11dGF0ZSlcbiAgICBEIC0tPiBFRShSZWluc2VydGlvbilcbiAgICBFRSAtLT4gRShFdm9sdmUpXG4gICAgRSAtLT4gRntUZXJtaW5hdGU_fVxuICAgIEYgLS0-IEdbeWVzXVxuICAgIEYgLS0-IEhbTm9dXG4gICAgSCAtLT4gQlxuICAgIEcgLS0-IEkoQmVzdCByZXN1bHQpIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRhcmsifSwidXBkYXRlRWRpdG9yIjpmYWxzZX0)](https://mermaid-js.github.io/mermaid-live-editor/#/edit/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW1JhbmRvbSBQb3B1bGF0aW9uXSAtLT4gQihTZWxlY3QgRml0dGVzdClcbiAgICBCIC0tPiBDKENyb3Nzb3ZlcilcbiAgICBDIC0tPiBEKE11dGF0ZSlcbiAgICBEIC0tPiBFRShSZWluc2VydGlvbilcbiAgICBFRSAtLT4gRShFdm9sdmUpXG4gICAgRSAtLT4gRntUZXJtaW5hdGU_fVxuICAgIEYgLS0-IEdbeWVzXVxuICAgIEYgLS0-IEhbTm9dXG4gICAgSCAtLT4gQlxuICAgIEcgLS0-IEkoQmVzdCByZXN1bHQpIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRhcmsifSwidXBkYXRlRWRpdG9yIjpmYWxzZX0)


### Initialization options

* `populationSize`:  Initial population size. Defaults to `100`

### Selection

* `selectionRate`: Rate for selecting fittest parents that will procreate in the crossover process. Default: `0.8`
* `selectionType`: One of the following selection strategies:
  * (default) `elite`: Only the best individuals from the last generation will be carried over (without any changes) to the next one.
  * `random`
  * `tournament`: Randomly divides the population in 3 groups and the winners of each group are carried over.
  * `roulette`: [Fitness proportionate selection](https://en.wikipedia.org/wiki/Fitness_proportionate_selection)
  * `stochasticUniversalSampling`
  * `boltzmannSelection`: Temperature controls the rate of selection avoiding premature convergence.
  * `rank`: Selection probabilities based on their rank position. `n + 1/fitnessSum`.

### Crossover

* `crossoverRepairFn`: Optional function for repairing damaged chromosomes.
* `crossoverType`: One of the following crossover strategies:
  * (default) `singlePoint`
  * `orderOne`
  * `uniform`
    * `crossoverRate`
  * `wholeArithmetic`
    * `crossoverAlpha`
  * `partiallyMatched`

### Mutation

* `mutationRate`: Rate of chromosomes that will be mutated. Default: `0.05`
* `mutationFn`: Custom mutation function.
* `mutationType`: One of the following mutation strategies:
  * (default) `shuffle`
  * `flipAll`
  * `flipSome`
    * `genMutationRate`: 0.5
  * `scramble`
  * `scrambleSlice`
    * `scrambleSize`: Default `chromosome.size/2`
  * `gaussian`
    * `genMutationRate`: Default 1

### Reinsertion

* `reinsertionFn`: Custom reinsertion function.
* `reinsertionType`: One of the following reinsertion strategies:
  * `pure`: Default
  * elitist
    * `survivalRate`: Number of survivors to keep on the population. Default: `0.2`
    * `survivorCount`: Absolute number of survivors to keep. Overrides `survivalRate`

### Simulated annealing

* `coolingRate`: Rate at which the temperature will change relative to fitness changes. Defaults to `0.85`

### Evolution options

* `fitnessSortDirection`: Default: `"DESC"`
* `maxPopulation`: Limit how large the population can become after reinsertion. Default `Infinity`
* `maxPopulationFn`: Dynamically limit the population size.


### Usage

Import the main `genetic` async function and type definitions under `Genetic` .

```typescript
import genetic, { Genetic } from "https://deno.land/x/genetic@v1.0.4/mod.ts";
```

State your problem by implementing the [`Problem interface`](https://github.com/bermi/genetic/blob/92649a8b9724b780e74ebfc34d9229f95a1402c2/types.ts#L180). In this case we'll solve the one max problem (the hello
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
  shouldTerminate: ([best], _generation, _temperature) => best.fitness === 1000,
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

## Development

`genetic` has been developed using [deno 🦕](https://deno.land/).

The `Makefile` includes shortcuts to commands that will help testing the project
and run the examples.


## Tests

To run the tests, call

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
