# arca-foundry-js

Salvador Workshop's 3D [Code-CAD](https://github.com/Irev-Dev/curated-code-cad) tools, designs, and components (in JavaScript).

## Usage

### `npm run jscad`

If a JSCAD project exists at `src/input/whateverProjectName/`, that can be built into an STL model by running:

`npm run jscad --project="whateverProjectName"`

The output model would then be located at `output/whateverProjectName/whateverProjectName.stl`

### `npm run jscad-batch`

The `jscad-batch` script relies on `arca.config.json` to run.

- `buildProjects`: The project folders to build
- `buildArgs`: A series of build options that are passed into each build project
