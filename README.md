# arca-foundry-js

Salvador Workshop's parametric builder for printable component kits (in JavaScript).

## Usage

### `npm run build-project`

A project in `/input` can be built by running:

`npm run build-project -- "project-input-folder-name"`

Project types are specified in the project folder's `config.json`:

```json
{
    "type": "basicBox",
    "metadata": {
        // ...
    },
    "parameters": {
        // ...
    }
}
```

### Project Folder Requirements

- `config.json`
- any additional required files. For example, the mould assembler expects a `model.stl` to be present as well.

## Project Types

For each project type, the valid parameters can be found in the corresponding script in `src/assembly-scripts`. The initial values can be found there, and edited if desired.

### `basicBox`

Build a simple box using:

`npm run build-project -- "basic-box"`

### `basicBoxHanger`

Build a box with hanger using:

`npm run build-project -- "basic-box-hanger"`

### `mouldOnePart` or `mouldTwoPart`

Build moulds around an STL model by running:

`npm run build-project -- "mould-1"`

The mould object must be named `model.stl` and placed in the appropriate directory in `input/` (in the above case, `input/mould-example-1/`). That project's output would then be placed in `output/mould-example-1/`

### `oneLevelShelf`

Build a one-level shelf using:

`npm run build-project -- "one-level-shelf"`

### `openTwoLevelShelf`

Build an open two-level shelf using:

`npm run build-project -- "open-two-level-shelf"`

### `twoLevelShelf`

Build a two-level shelf using:

`npm run build-project -- "two-level-shelf"`
