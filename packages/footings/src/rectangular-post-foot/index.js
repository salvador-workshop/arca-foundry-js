"use strict"

const rectangularPostFootInit = ({ jscad, swcadJs }) => {
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
    const rectangularPostFootDefaults = () => {
        const interfaceThickness = standards.INTERFACE_THICKNESS
        const fitGap = standards.FIT_GAP

        const defaultValues = {
            constants: {
                interfaceThickness
            },
            opts: {
                type: 'default',
            },
            dims: {
                size: [
                    math.inchesToMm(2),
                    math.inchesToMm(4),
                    math.inchesToMm(1),
                ],
                fitGap,
            },
            points: {},
            components: {},
            types: {
                default: { id: 'default', desc: 'Default model' },
                alt: { id: 'alt', desc: 'Alternate model' },
            },
        }

        const defaultOpts = {
            size: defaultValues.dims.size,
            type: defaultValues.opts.type,
            interfaceThickness: defaultValues.constants.interfaceThickness,
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
    const rectangularPostFootOpts = (opts) => {
        const defaults = rectangularPostFootDefaults()
        console.log('rectangularPostFootOpts() -- opts', opts)

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

        console.log('rectangularPostFootOpts() -- initOpts', initOpts)

        return initOpts
    }


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelParent
     * @access private
     */
    const rectangularPostFootProps = (opts) => {
        const defaults = rectangularPostFootDefaults()
        console.log('rectangularPostFootProps() -- prop opts', opts)

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

        /** Defined model types */
        const modelTypes = defaults.vals.types

        //--------------------------------------------------
        // MODEL PROPERTIES
        // Properties accessible to all model functions.

        const modelProperties = {
            constants: modelConstants,
            opts: modelOpts,
            dims: modelDims,
            points: modelPoints,
            components: modelComponents,
            types: modelTypes,
        }

        console.log('rectangularPostFootProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------
    // Secondary Modelling Functions
    //------------------------------------------------------------


    const subcomponent1 = (opts) => {
        const {
            size,
            width,
            depth,
        } = opts

        return sphere()
    }

    const subcomponent2 = (opts) => {
        const {
            size,
            width,
            depth,
        } = opts

        return cube()
    }


    //------------------------------------------------------------
    // Primary Modelling Functions
    //------------------------------------------------------------


    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.size
     * @param {string} opts.type
     * @param {number} opts.reinforcementThickness
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const rectangularPostFoot = (opts) => {
        const defaults = rectangularPostFootDefaults()
        const initOpts = rectangularPostFootOpts(opts)
        const modelProperties = rectangularPostFootProps(initOpts)

        const {
            type,
        } = modelProperties.opts

        const {
            size,
            width,
            depth,
            height,
            interfaceThickness,
            fitGap,
        } = modelProperties.dims

        //----------------------------------------
        // Initializing sub-components

        let subComp1 = subcomponent1({
            size,
            width,
            depth,
        })

        let subComp2 = subcomponent2({
            size,
            width,
            depth,
        })

        //----------------------------------------
        // Assembling sub-components

        const mainModel = union(
            subComp1,
            subComp2,
        )

        const modelParts = {
            subcomponent1: subComp1,
            subcomponent2: subComp2,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return rectangularPostFoot
}

module.exports = {
    init: rectangularPostFootInit
}
