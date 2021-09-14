export DENO_DIR = ./deno_dir

build: lock.json test deno_dir/dist/binaries/genetic deno_dir/dist/bundles/genetic.js

deno_dir/dist/binaries/%: mod.ts
	mkdir -p deno_dir/dist/binaries
	deno compile --unstable mod.ts
	mv $* $@

deno_dir/dist/bundles/%.js: mod.ts
	mkdir -p deno_dir/dist/bundles
	deno bundle mod.ts > $@

lock.json: src/deps.ts
	rm -rf deno_dir/deps
	deno cache --lock=$@ --lock-write $<
	deno cache src/deps.ts
	git add deno_dir/deps/*

format:
	deno fmt --ignore=deno_dir

lint:
	deno lint --unstable --ignore=deno_dir

info/%:
	deno info $@

doc/%:
	deno doc $@

run: lint
	deno run  --lock=lock.json --cached-only $@ src/genetic.ts

repl:
	deno repl

clean:
	rm -rf deno_dir/gen deno_dir/dl deno_dir/dist coverage

test: format lint
	deno test --lock=lock.json --cached-only --allow-none --unstable

EXAMPLES=$(wildcard examples/*.ts)
run-examples: $(EXAMPLES)
	for example in $^ ; do \
		echo "Running $${example}"; \
		deno run --unstable $${example} ; \
	done
	deno run --unstable --allow-read examples/tsp_webworkers/runner.ts

publish:
	land publish

coverage: clean test
	deno test --coverage=coverage --unstable
	deno coverage --lcov --unstable coverage/ > coverage/coverage.lcov
	genhtml -o coverage/html coverage/coverage.lcov
	open coverage/html/index.html