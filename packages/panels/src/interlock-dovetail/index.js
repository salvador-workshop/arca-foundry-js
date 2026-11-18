"use strict"

const interlockDovetailInit = ({ jscad, swcadJs }) => {
    const {
        cube,
        cylinder,
        sphere,
        cylinderElliptic,
        circle,
        cuboid,
        roundedCuboid,
        roundedCylinder,
        roundedRectangle,
        rectangle,
        triangle,
    } = jscad.primitives

    const {
        align,
        translate,
        rotate,
        mirror
    } = jscad.transforms

    const {
        intersect,
        subtract,
        union,
        scission
    } = jscad.booleans

    const {
        extrudeLinear,
        extrudeRotate,
        project
    } = jscad.extrusions

    const {
        measureDimensions,
        measureBoundingBox,
        measureVolume
    } = jscad.measurements

    const {
        hull,
        hullChain
    } = jscad.hulls

    const { vectorText } = jscad.text
    const { toOutlines } = jscad.geometries.geom2
    const { TAU } = jscad.maths.constants
    const { colorize } = jscad.colors

    const {
        standards,
    } = swcadJs.data

    const {
        math,
    } = swcadJs.calcs


    //==============================================================================


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof newModelParent
     * @access private
     */
    const interlockDovetailDefaults = () => {
        const defaultValues = {
            constants: {
                interfaceThickness: standards.INTERFACE_THICKNESS,
                panelBodyTypes: ['solid', 'mesh', 'lattice']
            },
            opts: {
                panelBodyType: 'solid'
            },
            dims: {
                size: [
                    math.inchesToMm(2),
                    math.inchesToMm(4),
                    math.inchesToMm(1),
                ],
            },
            points: {},
            components: {},
            types: {
                simple: { id: 'simple', desc: 'Simple interlocking panel (dovetail)' },
                segmented: { id: 'segmented', desc: 'Segmented interlocking panel (dovetail)' },
            },
        }

        const defaultOpts = {
            fitGap: standards.FIT_GAP,
            size: defaultValues.dims.size,
            type: defaultValues.types.solid.id,
            interfaceThickness: defaultValues.constants.interfaceThickness,
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
    const interlockDovetailOpts = (opts) => {
        const defaults = interlockDovetailDefaults()
        console.log('interlockDovetailOpts() -- opts', opts)

        // User options
        const {
            size = defaults.opts.size,
            type = defaults.opts.type,
            interfaceThickness = defaults.opts.interfaceThickness,
            fitGap = defaults.opts.fitGap,
        } = opts

        const initOpts = {
            size,
            type,
            interfaceThickness,
            fitGap,
        }

        console.log('interlockDovetailOpts() -- initOpts', initOpts)

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
    const interlockDovetailProps = (opts) => {
        const defaults = interlockDovetailDefaults()
        console.log('interlockDovetailProps() -- prop opts', opts)

        const {
            size,
            type,
            interfaceThickness,
            fitGap,
        } = opts

        /* ----------------------------------------
        * Prop calculations
        * ------------------------------------- */

        const width = size[0]
        const depth = size[1]
        const height = size[2]

        /* ----------------------------------------
        * Preparing Model Properties, Dimensions
        * ------------------------------------- */

        /** Constant values for model */
        const modelConstants = defaults.vals.constants

        /** Derived user options for the model */
        const modelOpts = {
            type,
        }

        /** Various dimensions for model */
        const modelDims = {
            size,
            width,
            depth,
            height,
            interfaceThickness,
            fitGap,
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

        console.log('interlockDovetailProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------------------------

    /* ----------------------------------------
    * Modelling, Component/Assembly Modules
    * ------------------------------------- */

    /** Sub-component 01 */
    const panelBody = (modelProps) => {
        const {
            opts,
            dims,
            points,
        } = modelProps

        return sphere()
    }

    /** Sub-component 02 */
    const basicPost = (modelProps) => {
        const {
            opts,
            dims,
            points,
        } = modelProps

        return cube()
    }

    /* ----------------------------------------
     * Complete Assembly
     * ------------------------------------- */

    /** Final Assembly */
    const finalAssembly = (modelProps) => {
        let subComp1 = panelBody(modelProps)
        let subComp2 = basicPost(modelProps)

        return union(
            subComp1,
            subComp2,
        )
    }

    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.size - 2D coord (length, width)
     * @param {number} opts.panelThickness
     * @param {number} opts.postThickness
     * @param {number} opts.dovetailLength
     * @param {string} opts.type
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const interlockDovetail = (opts) => {
        const defaults = interlockDovetailDefaults()
        const initOpts = interlockDovetailOpts(opts)
        const modelProperties = interlockDovetailProps(initOpts)

        /* ----------------------------------------
         * Outputs
         * ------------------------------------- */

        let subComp1 = panelBody(modelProperties)
        let subComp2 = basicPost(modelProperties)

        let mainModel = finalAssembly(modelProperties)

        let modelParts = {
            subcomponent1: subComp1,
            subcomponent2: subComp2,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return interlockDovetail
}

module.exports = {
    init: interlockDovetailInit
}
