#!/bin/bash

# Build main TypeScript
bun build src/ts/index.ts --outdir=public/assets/js --minify --target=browser
bun build src/ts/menu.ts --outdir=public/assets/js --minify --target=browser
bun build src/ts/writeups.ts --outdir=public/assets/js --minify --target=browser
bun build src/ts/blogs.ts --outdir=public/assets/js --minify --target=browser
bun build src/ts/fireBorder.ts --outdir=public/assets/js --minify --target=browser

pids=()

cd public
# Process each CSS file in parallel
for f in ../src/css/*.css; do
  output_file="assets/css/$(basename "$f")"
  
  # Run tailwindcss in background and store PID
  bunx tailwindcss -i "$f" -o "$output_file" --minify &
  pids+=($!)
done

# Wait for all background processes to finish
for pid in "${pids[@]}"; do
  wait "$pid"
done

cd ..

echo "All CSS files processed successfully!"

rm -rf out

#TODO
#cd src/rust/vectors && cargo run --release
