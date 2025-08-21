#!/bin/bash

# Build main TypeScript
bun build src/ts/index.ts --outdir=public/assets/js --minify --target=browser

# Build all CSS with Tailwind
for f in src/css/*.css; do
  bunx tailwindcss -i "$f" -o "public/assets/css/$(basename "$f")" --minify
done
