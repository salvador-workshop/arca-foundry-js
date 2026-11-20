"use strict"

const polyPostInit = ({ jscad, swcadJs }) => {
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

    const dovetailPostModule = require('./dovetail-post.js')
    const dovetailPost = dovetailPostModule.init({ jscad, swcadJs })


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
    const polyPostDefaults = () => {
        const interfaceThickness = standards.INTERFACE_THICKNESS
        const fitGap = standards.FIT_GAP

        const defaultValues = {
            constants: {
                interfaceThickness
            },
            opts: {
                type: 'basic',
                dovetailOpts: {
                    length: math.inchesToMm(1 / 2),
                    type: 'male',
                },
            },
            dims: {
                length: math.inchesToMm(3.5),
                thickness: 5,
                fitGap,
            },
            points: {},
            components: {},
            types: {
                basic: { id: 'basic', desc: 'Basic model' },
                dovetail: { id: 'dovetail', desc: 'Dovetail model' },
            },
        }

        const defaultOpts = {
            length: defaultValues.dims.length,
            thickness: defaultValues.dims.thickness,
            type: defaultValues.opts.type,
            dovetailOpts: defaultValues.opts.dovetailOpts,
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
    const polyPostOpts = (opts) => {
        const defaults = polyPostDefaults()
        console.log('polyPostOpts() -- opts', opts)

        // User options
        const {
            length = defaults.opts.length,
            thickness = defaults.opts.thickness,
            type = defaults.opts.type,
            dovetailOpts = defaults.opts.dovetailOpts,
            fitGap = defaults.opts.fitGap,
        } = opts

        const initOpts = {
            length,
            thickness,
            type,
            dovetailOpts,
            fitGap,
        }

        console.log('polyPostOpts() -- initOpts', initOpts)

        return initOpts
    }


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelParent
     * @access private
     */
    const polyPostProps = (opts) => {
        const defaults = polyPostDefaults()
        console.log('polyPostProps() -- prop opts', opts)

        const {
            length,
            thickness,
            type,
            dovetailOpts,
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
            dovetailOpts,
        }

        /** Various dimensions for model */
        const modelDims = {
            length,
            thickness,
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

        console.log('polyPostProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------
    // Secondary Modelling Functions
    //------------------------------------------------------------


    //------------------------------------------------------------
    // Primary Modelling Functions
    //------------------------------------------------------------


    /**
     * Generates a post with square cross-section
     * @param {Object} opts - Options for the model
     * @param {number} opts.length - post length
     * @param {number} opts.thickness - post thickness
     * @param {string} opts.type - one of ['basic', 'dovetail']
     * @param {object} opts.dovetailOpts - options for 'dovetail' type
     * @param {number} opts.dovetailOpts.length - dovetail length
     * @param {string} opts.dovetailOpts.type - 'male' or 'female'
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const polyPost = (opts) => {
        const defaults = polyPostDefaults()
        const initOpts = polyPostOpts(opts)
        const modelProperties = polyPostProps(initOpts)

        const {
            type,
            dovetailOpts,
        } = modelProperties.opts

        const {
            length,
            thickness,
            fitGap,
        } = modelProperties.dims

        //----------------------------------------
        // Initializing sub-components

        let pPost = null

        if (type == 'dovetail') {
            const dovetailPostOpts = {
                length,
                thickness,
                dovetailLength: dovetailOpts.length,
                type: dovetailOpts.type,
                fitGap,
            }
            pPost = dovetailPost(dovetailPostOpts)
        } else {
            // default to 'basic'
            pPost = cuboid({
                size: [
                    length,
                    thickness,
                    thickness,
                ]
            })
        }

        //----------------------------------------
        // Assembling sub-components

        const mainModel = position.ctr(pPost)

        const modelParts = {
            mainModel
        }

        return [mainModel, modelParts, modelProperties]
    }

    return polyPost
}

module.exports = {
    init: polyPostInit
}
