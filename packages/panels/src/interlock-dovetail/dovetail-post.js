const dovetailPostInit = ({ jscad, swcadJs }) => {
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


    //------------------------------------------------------------
    // Model Internal Functions
    //------------------------------------------------------------


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof newModelParent
     * @access private
     */
    const dovetailPostDefaults = () => {
        const defaultValues = {
            constants: {
                interfaceThickness: standards.INTERFACE_THICKNESS,
                fitGap: standards.FIT_GAP,
            },
            opts: {},
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
                male: { id: 'male', desc: 'Male dovetail post' },
                female: { id: 'female', desc: 'Female dovetail post' },
            },
        }

        const defaultOpts = {
            fitGap: standards.FIT_GAP,
            size: defaultValues.dims.size,
            type: defaultValues.types.male.id,
            interfaceThickness: defaultValues.constants.interfaceThickness,
        }

        return {
            opts: defaultOpts,
            vals: defaultValues,
        }
    }

    /**
     * Initializes options with user input
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelParent
     * @access private
     */
    const dovetailPostOpts = (opts) => {
        const defaults = dovetailPostDefaults()
        console.log('dovetailPostOpts() -- opts', opts)

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

        console.log('dovetailPostOpts() -- initOpts', initOpts)

        return initOpts
    }

    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelParent
     * @access private
     */
    const dovetailPostProps = (opts) => {
        const defaults = dovetailPostDefaults()
        console.log('dovetailPostProps() -- prop opts', opts)

        const {
            size,
            type,
            interfaceThickness,
            fitGap,
        } = opts

        //----------------------------------------
        // Prop calculations

        const width = size[0]
        const depth = size[1]
        const height = size[2]

        //----------------------------------------
        // Preparing Model Properties, Dimensions

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

        //----------------------------------------
        // MODEL PROPERTIES
        // Properties accessible to all model functions.

        const modelProperties = {
            constants: modelConstants,
            opts: modelOpts,
            dims: modelDims,
            points: modelPoints,
            components: modelComponents,
        }

        console.log('dovetailPostProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------
    // Secondary Modelling Functions
    //------------------------------------------------------------


    const dovetailPostBlank = (opts) => {
        return null
    }

    const dovetailPostCutaway = (opts) => {
        return null
    }

    const dovetailPostDovetailProfile = (opts) => {
        return null
    }

    const dovetailPostDovetails = (opts) => {
        return null
    }


    //------------------------------------------------------------
    // Primary Modelling Functions
    //------------------------------------------------------------


    /**
     * Post with interlocking dovetails
     * @param {object} opts - Options
     * @param {number} opts.length - 3D coord (length, width, height)
     * @param {number} opts.thickness - 3D coord (length, width, height)
     * @param {number} opts.dovetailLength - orientation axis. One of 'x', 'y', or 'z'
     * @param {string} opts.type - 'male' or 'female'
     * @param {number} opts.fitGap
     * @returns {geom3} JSCAD 3D geometry
     */
    const dovetailPost = (opts) => {
        const {
            length,
            thickness,
            dovetailLength,
            type,
            fitGap,
        } = opts

        const dPostBlank = dovetailPostBlank(opts)
        const dPostCutaway = dovetailPostCutaway(opts)
        const dPostDovetailProfile = dovetailPostDovetailProfile(opts)
        const dPostDovetails = dovetailPostDovetails(opts)

        return null
    }

    return dovetailPost
}

module.exports = {
    init: dovetailPostInit,
}
