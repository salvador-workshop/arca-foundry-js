"use strict"

const interlockDovetailInit = ({ jscad, swcadJs }) => {
    const {
        cuboid,
    } = jscad.primitives

    const {
        align,
        rotate,
    } = jscad.transforms

    const {
        union,
    } = jscad.booleans

    const { TAU } = jscad.maths.constants

    const {
        standards,
    } = swcadJs.data

    const {
        math,
    } = swcadJs.calcs

    const dovetailPostModule = require('./dovetail-post.js')
    const dovetailPost = dovetailPostModule.init({ jscad, swcadJs })

    const polyPanelModule = require('../poly-panel/index.js')
    const polyPanel = polyPanelModule.init({ jscad, swcadJs })


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
    const interlockDovetailDefaults = () => {
        const interfaceThickness = standards.INTERFACE_THICKNESS
        const fitGap = standards.FIT_GAP

        const defaultValues = {
            constants: {
                interfaceThickness,
                fitGap,
                bodyTypes: ['solid', 'mesh', 'lattice', 'minimal'],
                positionTypes: ['face', 'side'],
            },
            opts: {
                type: 'simple',
                bodyType: 'solid',
                positionType: 'face',
            },
            dims: {
                size: [
                    math.inchesToMm(3),
                    math.inchesToMm(4),
                ],
                panelThickness: interfaceThickness,
                postThickness: 5,
                dovetailLength: math.inchesToMm(1 / 2),
                fitGap,
            },
            points: {},
            components: {},
            types: {
                simple: { id: 'simple', desc: 'Simple interlocking panel (dovetail)' },
                segmented: { id: 'segmented', desc: 'Segmented interlocking panel (dovetail)' },
            },
        }

        const defaultOpts = {
            size: defaultValues.dims.size,
            panelThickness: defaultValues.dims.panelThickness,
            postThickness: defaultValues.dims.postThickness,
            dovetailLength: defaultValues.dims.dovetailLength,
            type: defaultValues.opts.type,
            bodyType: defaultValues.opts.bodyType,
            positionType: defaultValues.opts.positionType,
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
    const interlockDovetailOpts = (opts) => {
        const defaults = interlockDovetailDefaults()
        console.log('interlockDovetailOpts() -- opts', opts)

        // User options
        const {
            size = defaults.opts.size,
            panelThickness = defaults.opts.panelThickness,
            postThickness = defaults.opts.postThickness,
            dovetailLength = defaults.opts.dovetailLength,
            type = defaults.opts.type,
            bodyType = defaults.opts.bodyType,
            positionType = defaults.opts.positionType,
            fitGap = defaults.opts.fitGap,
        } = opts

        const initOpts = {
            size,
            panelThickness,
            postThickness,
            dovetailLength,
            type,
            bodyType,
            positionType,
            fitGap,
        }

        console.log('interlockDovetailOpts() -- initOpts', initOpts)

        return initOpts
    }


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
            panelThickness,
            postThickness,
            dovetailLength,
            type,
            bodyType,
            positionType,
            fitGap,
        } = opts

        //----------------------------------------
        // Prop calculations

        const length = size[0]
        const width = size[1]

        const panelSize = [
            size[0] - (postThickness * 2),
            size[1] - (postThickness * 2),
        ]
        const panelLength = panelSize[0]
        const panelWidth = panelSize[1]

        //----------------------------------------
        // Preparing Model Properties, Dimensions

        /** Constant values for model */
        const modelConstants = defaults.vals.constants

        /** Derived user options for the model */
        const modelOpts = {
            type,
            bodyType,
            positionType,
        }

        /** Various dimensions for model */
        const modelDims = {
            size,
            panelThickness,
            postThickness,
            dovetailLength,
            fitGap,
            length,
            width,
            panelSize,
            panelLength,
            panelWidth,
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

        console.log('interlockDovetailProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------
    // Secondary Modelling Functions
    //------------------------------------------------------------


    const basicPost = (opts) => {
        const {
            length,
            thickness,
        } = opts

        return cuboid({ size: [length, thickness, thickness] })
    }


    //------------------------------------------------------------
    // Primary Modelling Functions
    //------------------------------------------------------------


    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.size - 2D coord (length, width)
     * @param {number} opts.panelThickness
     * @param {number} opts.postThickness
     * @param {number} opts.dovetailLength
     * @param {string} opts.type
     * @param {string} opts.bodyType
     * @param {string} opts.positionType
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const interlockDovetail = (opts) => {
        const defaults = interlockDovetailDefaults()
        const initOpts = interlockDovetailOpts(opts)
        const modelProperties = interlockDovetailProps(initOpts)

        const {
            type,
            bodyType,
            positionType,
        } = modelProperties.opts

        const {
            size,
            panelThickness,
            postThickness,
            dovetailLength,
            fitGap,
            length,
            width,
            panelSize,
            panelLength,
            panelWidth,
        } = modelProperties.dims

        //----------------------------------------
        // Initializing sub-components

        const polyPanelOpts = {
            size: panelSize,
            thickness: panelThickness,
            type: bodyType,
        }
        const pBody = polyPanel(polyPanelOpts)[0]

        const pBeam = basicPost({
            length: panelLength,
            thickness: postThickness,
        })

        const sidePostType = positionType == 'face' ? 'male' : 'female'
        const sidePostOpts = {
            length: width,
            thickness: postThickness,
            dovetailLength,
            type: sidePostType,
        }
        const pPost = dovetailPost(sidePostOpts)

        //----------------------------------------
        // Assembling sub-components

        let panelAssembly = pBody

        // join top post to body
        panelAssembly = union(
            align({ modes: ['center', 'max', 'min'] }, panelAssembly),
            align({ modes: ['center', 'min', 'min'] }, pBeam),
        )

        // join bottom post to body
        panelAssembly = union(
            align({ modes: ['center', 'min', 'min'] }, panelAssembly),
            align({ modes: ['center', 'max', 'min'] }, pBeam),
        )

        // join right side post to body
        const rightPost = rotate([0, 0, TAU / -4], pPost)
        panelAssembly = union(
            align({ modes: ['max', 'center', 'min'] }, panelAssembly),
            align({ modes: ['min', 'center', 'min'] }, rightPost),
        )

        // join left side post to body
        const leftPost = rotate([0, 0, TAU / 4], pPost)
        panelAssembly = union(
            align({ modes: ['min', 'center', 'min'] }, panelAssembly),
            align({ modes: ['max', 'center', 'min'] }, leftPost),
        )

        const mainModel = panelAssembly

        const modelParts = {
            subcomponent1: pBody,
            subcomponent2: pBeam,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return interlockDovetail
}

module.exports = {
    init: interlockDovetailInit
}
