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
        position,
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
            constants: {},
            opts: {},
            dims: {
                postSize: [
                    5,
                    7.5
                ],
                sleeveHeight: 4,
                baseExtWidth: 4,
                thickness: interfaceThickness,
                fitGap,
            },
            points: {},
            components: {},
            types: {},
        }

        const defaultOpts = {
            postSize: defaultValues.dims.postSize,
            sleeveHeight: defaultValues.dims.sleeveHeight,
            baseExtWidth: defaultValues.dims.baseExtWidth,
            thickness: defaultValues.dims.thickness,
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

        // User options
        const {
            postSize = defaults.opts.postSize,
            sleeveHeight = defaults.opts.sleeveHeight,
            baseExtWidth = defaults.opts.baseExtWidth,
            thickness = defaults.opts.thickness,
            fitGap = defaults.opts.fitGap,
        } = opts

        const initOpts = {
            postSize,
            sleeveHeight,
            baseExtWidth,
            thickness,
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
    const rectangularPostFootProps = (opts) => {
        const defaults = rectangularPostFootDefaults()

        const {
            postSize,
            sleeveHeight,
            baseExtWidth,
            thickness,
            fitGap,
        } = opts

        //----------------------------------------
        // Prop calculations

        const postWidth = postSize[0]
        const postDepth = postSize[1]

        //----------------------------------------
        // Preparing Model Properties, Dimensions

        /** Constant values for model */
        const modelConstants = defaults.vals.constants

        /** Derived user options for the model */
        const modelOpts = defaults.vals.opts

        /** Various dimensions for model */
        const modelDims = {
            postSize,
            sleeveHeight,
            baseExtWidth,
            thickness,
            fitGap,
            postWidth,
            postDepth,
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


        return modelProperties
    }


    //------------------------------------------------------------
    // Secondary Modelling Functions
    //------------------------------------------------------------


    const footBase = (opts) => {
        const {
            baseExtWidth,
            thickness,
            postWidth,
            postDepth,
        } = opts

        const footSize = [
            postWidth + (baseExtWidth * 2),
            postDepth + (baseExtWidth * 2),
        ]

        return cuboid({
            size: [
                footSize[0],
                footSize[1],
                thickness
            ]
        })
    }

    const footSleeve = (opts) => {
        const {
            sleeveHeight,
            thickness,
            fitGap,
            postWidth,
            postDepth,
        } = opts

        const fittedPostSize = [
            postWidth + (fitGap * 2),
            postDepth + (fitGap * 2),
        ]

        const blankSize = [
            fittedPostSize[0] + (thickness * 2),
            fittedPostSize[1] + (thickness * 2),
            sleeveHeight
        ]
        const sleeveBlank = cuboid({ size: blankSize })

        const cutawaySize = [
            fittedPostSize[0],
            fittedPostSize[1],
            sleeveHeight * 2
        ]
        const sleeveCutaway = cuboid({ size: cutawaySize })

        return subtract(
            sleeveBlank,
            sleeveCutaway,
        )
    }


    //------------------------------------------------------------
    // Primary Modelling Functions
    //------------------------------------------------------------


    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.postSize - post cross-section size (width, depth)
     * @param {number} opts.sleeveHeight - height of footing sleeve
     * @param {number} opts.baseExtWidth - width of base extension (edge of post to base edge)
     * @param {number} opts.thickness - thickness of footing base and post sleeve
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const rectangularPostFoot = (opts) => {
        const initOpts = rectangularPostFootOpts(opts)
        const modelProperties = rectangularPostFootProps(initOpts)

        const {
            postSize,
            sleeveHeight,
            baseExtWidth,
            thickness,
            fitGap,
            postWidth,
            postDepth,
        } = modelProperties.dims

        //----------------------------------------
        // Initializing sub-components

        const ftgBase = footBase({
            baseExtWidth,
            thickness,
            postWidth,
            postDepth,
        })

        const ftgSleeve = footSleeve({
            sleeveHeight,
            thickness,
            fitGap,
            postWidth,
            postDepth,
        })

        //----------------------------------------
        // Assembling sub-components

        const footAssembly = union(
            position.ctrMax(ftgBase),
            position.ctrMin(ftgSleeve),
        )

        const mainModel = position.ctr(footAssembly)

        const modelParts = {
            subcomponent1: ftgBase,
            subcomponent2: ftgSleeve,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return rectangularPostFoot
}

module.exports = {
    init: rectangularPostFootInit
}
