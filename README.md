# arca-foundry-js

Salvador Workshop's 3D [Code-CAD](https://github.com/Irev-Dev/curated-code-cad) tools, designs, and components (in JavaScript).

## Usage

### `npm run build-project`

Project types are specified in the project's `config.json`:

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

#### Project type: `basicBox`

Build a simple box using:

`npm run build-project -- "box-example-1"`

...

#### Project type: `mouldOnePart` or `mouldTwoPart`

Build moulds around an STL model by running:

`npm run build-project -- "mould-example-1"`

The mould object must be named `model.stl` and placed in the appropriate directory in `input/` (in the above case, `input/mould-example-1/`). That project's output would then be placed in `output/mould-example-1/`
