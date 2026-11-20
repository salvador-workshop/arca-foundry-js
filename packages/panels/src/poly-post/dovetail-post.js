const dovetailPostInit = ({ jscad, swcadJs }) => {
    const {
        cuboid,
    } = jscad.primitives

    const {
        align,
        rotate,
    } = jscad.transforms

    const {
        intersect,
        subtract,
        union,
    } = jscad.booleans

    const {
        extrudeLinear,
    } = jscad.extrusions

    const { TAU } = jscad.maths.constants

    const {
        standards,
    } = swcadJs.data

    const {
        math,
        position,
    } = swcadJs.calcs

    const {
        connections,
    } = swcadJs.profiles


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
            opts: {
                type: 'male'
            },
            dims: {
                length: math.inchesToMm(3),
                thickness: 5,
                dovetailLength: math.inchesToMm(0.625),
                fitGap: standards.FIT_GAP,
            },
            points: {},
            components: {},
            types: {
                male: { id: 'male', desc: 'Male dovetail post' },
                female: { id: 'female', desc: 'Female dovetail post' },
            },
        }

        const defaultOpts = {
            length: defaultValues.dims.length,
            thickness: defaultValues.dims.thickness,
            dovetailLength: defaultValues.dims.dovetailLength,
            type: defaultValues.opts.type,
            fitGap: defaultValues.dims.fitGap,
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

        // User options
        const {
            length = defaults.opts.length,
            thickness = defaults.opts.thickness,
            dovetailLength = defaults.opts.dovetailLength,
            type = defaults.opts.type,
            fitGap = defaults.opts.fitGap,
        } = opts

        const initOpts = {
            length,
            thickness,
            dovetailLength,
            type,
            fitGap,
        }


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

        const {
            length,
            thickness,
            dovetailLength,
            type,
            fitGap,
        } = opts

        //----------------------------------------
        // Prop calculations

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
            length,
            thickness,
            dovetailLength,
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


        return modelProperties
    }


    //------------------------------------------------------------
    // Secondary Modelling Functions
    //------------------------------------------------------------


    const dovetailPostBlank = (opts) => {
        const {
            length,
            thickness,
            type,
            fitGap,
        } = opts

        const fitAdj = fitGap / 2
        const fitHeight = thickness - fitAdj
        const cutawayHeight = thickness / 2
        const cutawayWidth = thickness / 2 + fitAdj

        let postBlank = cuboid({ size: [length, thickness, fitHeight] })
        postBlank = align({ modes: ['center', 'max', 'max'] }, postBlank)

        let cutaway = cuboid({ size: [length, cutawayWidth, cutawayHeight] })
        cutaway = align({ modes: ['center', 'max', 'max'] }, cutaway)

        let dPostBlank = subtract(postBlank, cutaway)
        if (type == 'female') {
            dPostBlank = rotate([TAU / 4, 0, 0], dPostBlank)
            dPostBlank = rotate([0, 0, TAU / 2], dPostBlank)
        }

        return position.ctrMin(dPostBlank)
    }

    const dovetailPostDovetailProfile = (opts) => {
        const {
            length,
            thickness,
            dovetailLength,
            type,
            fitGap,
        } = opts

        const connectionEdgeMargin = thickness / 2
        const dovetailsGap = connectionEdgeMargin * 2
        const dovetailUnits = Math.floor(length / dovetailLength)

        const dovetailRowProfiles = connections.tabRow.dovetailRow({
            size: [length, thickness * 1.5],
            numConnectors: dovetailUnits,
            interfaceMargin: [dovetailsGap, connectionEdgeMargin],
            fitGap,
        })[0]

        const maleDovetailRowProfile = dovetailRowProfiles[0]
        const femaleDovetailRowProfile = dovetailRowProfiles[1]

        let dPostDovetailProfile = maleDovetailRowProfile
        if (type == 'female') {
            dPostDovetailProfile = femaleDovetailRowProfile
            dPostDovetailProfile = rotate([0, 0, TAU / 2], dPostDovetailProfile)
        }

        return dPostDovetailProfile
    }

    const dovetailPostDovetailEdge = (opts) => {
        const {
            length,
            thickness,
            dovetailLength,
            type,
            fitGap,
        } = opts

        const extrudeHeightGrooves = thickness * 1.25
        const extrudeHeightDovetails = thickness * 0.75
        const dPostDovetailProfile = dovetailPostDovetailProfile({
            length,
            thickness,
            dovetailLength,
            type,
            fitGap,
        })

        let dovetailEdge = null
        if (type == 'female') {
            const dPostDovetailGrooves = extrudeLinear({ height: extrudeHeightGrooves }, dPostDovetailProfile)
            dovetailEdge = dPostDovetailGrooves
        } else {
            const dPostDovetails = extrudeLinear({ height: extrudeHeightDovetails }, dPostDovetailProfile)
            dovetailEdge = dPostDovetails
            dovetailEdge = rotate([TAU / 4, 0, 0], dovetailEdge)
        }

        return dovetailEdge
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
        const inOpts = dovetailPostOpts(opts)
        const {
            length,
            thickness,
            dovetailLength,
            type,
            fitGap,
        } = inOpts

        const dPostBlank = dovetailPostBlank({
            length,
            thickness,
            type,
            fitGap,
        })
        const dPostDovetailEdge = dovetailPostDovetailEdge({
            length,
            thickness,
            dovetailLength,
            type,
            fitGap,
        })

        let dovetailPostAssembly = null
        if (type == 'male') {
            dovetailPostAssembly = union(
                align({ modes: ['center', 'max', 'min'] }, dPostBlank),
                align({ modes: ['center', 'max', 'min'] }, dPostDovetailEdge),
            )
        } else {
            dovetailPostAssembly = intersect(
                align({ modes: ['center', 'min', 'min'] }, dPostBlank),
                align({ modes: ['center', 'min', 'min'] }, dPostDovetailEdge),
            )
        }

        return position.ctr(dovetailPostAssembly)
    }

    return dovetailPost
}

module.exports = {
    init: dovetailPostInit,
}
