"use strict"

const polyPanelInit = ({ jscad, swcadJs }) => {
    const {
        cuboid,
    } = jscad.primitives

    const {
        standards,
    } = swcadJs.data

    const {
        math,
    } = swcadJs.calcs

    const {
        mesh,
        reinforcements,
    } = swcadJs.components


    //==============================================================================


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof newModelParent
     * @access private
     */
    const polyPanelDefaults = () => {
        const interfaceThickness = standards.INTERFACE_THICKNESS

        const defaultValues = {
            constants: {},
            opts: {
                type: 'solid',
                holePattern: 'tri',
                reinforcementPattern: 'full',
            },
            dims: {
                size: [
                    math.inchesToMm(2),
                    math.inchesToMm(4),
                ],
                thickness: interfaceThickness,
                holeRadius: math.inchesToMm(7 / 32),
                reinforcementThickness: [
                    interfaceThickness * 2,
                    interfaceThickness * 1.625,
                    interfaceThickness * 1.25
                ],
            },
            points: {},
            components: {},
            types: {
                solid: { id: 'solid', desc: 'Solid panel' },
                mesh: { id: 'mesh', desc: 'Mesh panel' },
                lattice: { id: 'lattice', desc: 'Lattice panel' },
                minimal: { id: 'minimal', desc: 'Minimal panel' },
            },
        }

        const defaultOpts = {
            size: defaultValues.dims.size,
            thickness: defaultValues.dims.thickness,
            type: defaultValues.opts.type,
            holeRadius: defaultValues.dims.holeRadius,
            holePattern: defaultValues.opts.holePattern,
            reinforcementThickness: defaultValues.dims.reinforcementThickness,
            reinforcementPattern: defaultValues.opts.reinforcementPattern,
        }

        return {
            opts: defaultOpts,
            vals: defaultValues,
        }
    }


    //------------------------------------------------------------------------------


    /**
     * Initializes options with user input
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelParent
     * @access private
     */
    const polyPanelOpts = (opts) => {
        const defaults = polyPanelDefaults()
        console.log('polyPanelOpts() -- opts', opts)

        // User options
        const {
            size = defaults.opts.size,
            thickness = defaults.opts.thickness,
            type = defaults.opts.type,
            holeRadius = defaults.opts.holeRadius,
            holePattern = defaults.opts.holePattern,
            reinforcementThickness = defaults.opts.reinforcementThickness,
            reinforcementPattern = defaults.opts.reinforcementPattern,
        } = opts

        const initOpts = {
            size,
            thickness,
            type,
            holeRadius,
            holePattern,
            reinforcementThickness,
            reinforcementPattern,
        }

        console.log('polyPanelOpts() -- initOpts', initOpts)

        return initOpts
    }


    //------------------------------------------------------------------------------


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelParent
     * @access private
     */
    const polyPanelProps = (opts) => {
        const defaults = polyPanelDefaults()
        console.log('polyPanelProps() -- prop opts', opts)

        const {
            size,
            thickness,
            type,
            holeRadius,
            holePattern,
            reinforcementThickness,
            reinforcementPattern,
        } = opts

        /* ----------------------------------------
        * Prop calculations
        * ------------------------------------- */

        const width = size[0]
        const depth = size[1]
        const holeDiam = holeRadius * 2
        const holeDistance = holeDiam + (thickness * 1.625)
        const gapThickness = thickness * 1.125

        /* ----------------------------------------
        * Preparing Model Properties, Dimensions
        * ------------------------------------- */

        /** Constant values for model */
        const modelConstants = defaults.vals.constants

        /** Derived user options for the model */
        const modelOpts = {
            type,
            holePattern,
            reinforcementPattern,
        }

        /** Various dimensions for model */
        const modelDims = {
            size,
            thickness,
            holeRadius,
            reinforcementThickness,
            width,
            depth,
            holeDiam,
            holeDistance,
            gapThickness,
        }

        /** Various key points for model */
        const modelPoints = defaults.vals.points

        /** Components used by model */
        const modelComponents = defaults.vals.components

        /* ---------------------------------------------
        *  Model Properties
        * ----------------------------------------------
        * Properties accessible to all model functions.
        * --------------------------------------------- */

        const modelProperties = {
            constants: modelConstants,
            opts: modelOpts,
            dims: modelDims,
            points: modelPoints,
            components: modelComponents,
        }

        console.log('polyPanelProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------------------------

    /* ----------------------------------------
    * Modelling, Component/Assembly Modules
    * ------------------------------------- */

    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.size
     * @param {number} opts.thickness
     * @param {string} opts.type
     * @param {number} opts.holeRadius
     * @param {string} opts.holePattern
     * @param {number[]} opts.reinforcementThickness
     * @param {string} opts.reinforcementPattern
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const polyPanel = (opts) => {
        const defaults = polyPanelDefaults()
        const initOpts = polyPanelOpts(opts)
        const modelProperties = polyPanelProps(initOpts)

        const {
            type,
            holePattern,
            reinforcementPattern,
        } = modelProperties.opts

        const {
            size,
            thickness,
            holeRadius,
            reinforcementThickness,
            width,
            depth,
            holeDiam,
            holeDistance,
            gapThickness,
        } = modelProperties.dims

        let pBody = null

        if (type == 'mesh') {
            const meshOpts = {
                size: size,
                edgeMargin: thickness,
                holeRadius,
                holeDistance,
                holePattern,
            }
            pBody = mesh.meshPanel(meshOpts)[0]
        } else if (type == 'lattice') {
            const latticeOpts = {
                size: size,
                edgeMargin: thickness,
                holeRadius,
                gapThickness,
                holePattern,
            }
            pBody = mesh.meshLatticePanel(latticeOpts)[0]
        } else if (type == 'minimal') {
            const rectPanelOpts = {
                size: [
                    size[0],
                    size[1],
                    thickness,
                ],
                reinforcementPattern,
                reinforcementThickness,
            }
            pBody = reinforcements.reinforcedRectPanel(rectPanelOpts)[0]
        } else {
            // defaults to 'solid' bodyType
            pBody = cuboid({
                size: [
                    size[0],
                    size[1],
                    thickness,
                ]
            })
        }

        const mainModel = pBody

        const modelParts = {
            mainModel
        }

        return [mainModel, modelParts, modelProperties]
    }

    return polyPanel
}

module.exports = {
    init: polyPanelInit
}
