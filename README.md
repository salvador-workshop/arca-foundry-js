# arca-foundry-js

Salvador Workshop's 3D [Code-CAD](https://github.com/Irev-Dev/curated-code-cad) tools, designs, and components (in JavaScript).

## Usage

### `npm run jscad`

If a JSCAD project exists at `src/input/example1/`, that can be built into an STL model by running:

`npm run jscad --project="example1"`

The output model would then be located at `output/example1/example1.stl`

### `npm run jscad-batch`

The `jscad-batch` script relies on `arca.config.json` to run.

- `buildProjects`: The project folders to build
- `buildArgs`: A series of build options that are passed into each build project
