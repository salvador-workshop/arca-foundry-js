# arca-foundry-js

Salvador Workshop's 3D [Code-CAD](https://github.com/Irev-Dev/curated-code-cad) tools, designs, and components (in JavaScript).

## Usage

### `npm run jscad`

If a JSCAD project exists at `src/input/example1/`, that can be built into an STL model by running:

`npm run jscad --project="example1"`

The output model would then be located at `output/example1/example1.stl`

### `npm run moulds`

Build moulds around an STL model by running:

`npm run mould --project="mould-example-1"`

The mould object must be named `model.stl` and placed in the appropriate directory in `input/` (in the above case, `input/mould-example-1/`). That project's output would then be placed in `output/mould-example-1/`
