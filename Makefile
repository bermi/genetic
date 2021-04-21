build: export DENO_DIR = ./deno_dir
build: lock.json test deno_dir/dist/binaries/genetic deno_dir/dist/bundles/genetic.js

deno_dir/dist/binaries/%: src/%.ts
	mkdir -p deno_dir/dist/binaries
	deno compile --unstable --lite src/$*.ts
	mv $* $@

deno_dir/dist/bundles/%.js: src/%.ts
	mkdir -p deno_dir/dist/bundles
	deno bundle src/$*.ts > $@

lock.json: export DENO_DIR = ./deno_dir
lock.json: src/deps.ts
	deno cache --lock=$@ --lock-write $<
	deno cache src/deps.ts
	git add deno_dir/deps/*

dev:
	deno run --watch  --lock=lock.json --cached-only --unstable $@

format:
	deno fmt

lint:
	deno lint --unstable

info/%:
	deno info $@

doc/%:
	deno doc $@

run: lint
	deno run  --lock=lock.json --cached-only $@ src/genetic.ts

repl:
	deno repl

clean:
	rm -rf deno_dir/gen deno_dir/dl deno_dir/dist

test: format lint
	deno test --lock=lock.json --cached-only --allow-none --unstable

EXAMPLES=$(wildcard examples/*.ts)
run-examples: $(EXAMPLES)
	for example in $^ ; do \
		echo "Running $${example}"; \
		deno run --unstable $${example} ; \
	done

publish:
	land publish