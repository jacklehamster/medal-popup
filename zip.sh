./build.sh

bun run build:example

rm -rf game.zip
rm -rf example/node_modules
zip -r game.zip example
