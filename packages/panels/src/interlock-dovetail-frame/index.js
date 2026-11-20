"use strict"

const interlockDovetailFrameInit = ({ jscad, swcadJs }) => {
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
        position,
    } = swcadJs.calcs

    // const dovetailPostModule = require('./dovetail-post.js')
    // const dovetailPost = dovetailPostModule.init({ jscad, swcadJs })

    // const polyPanelModule = require('../poly-panel/index.js')
    // const polyPanel = polyPanelModule.init({ jscad, swcadJs })

    const polyPostModule = require('../poly-post/index.js')
    const polyPost = polyPostModule.init({ jscad, swcadJs })


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
    const interlockDovetailFrameDefaults = () => {
        // const interfaceThickness = standards.INTERFACE_THICKNESS
        const fitGap = standards.FIT_GAP

        const defaultValues = {
            constants: {
                positionTypes: ['face', 'side'],
            },
            opts: {
                type: 'simple',
                positionType: 'face',
            },
            dims: {
                size: [
                    math.inchesToMm(3),
                    math.inchesToMm(4),
                ],
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
            postThickness: defaultValues.dims.postThickness,
            dovetailLength: defaultValues.dims.dovetailLength,
            type: defaultValues.opts.type,
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
    const interlockDovetailFrameOpts = (opts) => {
        const defaults = interlockDovetailFrameDefaults()

        // User options
        const {
            size = defaults.opts.size,
            postThickness = defaults.opts.postThickness,
            beamLevels,
            dovetailLength = defaults.opts.dovetailLength,
            type = defaults.opts.type,
            positionType = defaults.opts.positionType,
            fitGap = defaults.opts.fitGap,
        } = opts

        const initOpts = {
            size,
            postThickness,
            beamLevels,
            dovetailLength,
            type,
            positionType,
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
    const interlockDovetailFrameProps = (opts) => {
        const defaults = interlockDovetailFrameDefaults()

        const {
            size,
            postThickness,
            beamLevels,
            dovetailLength,
            type,
            positionType,
            fitGap,
        } = opts

        //----------------------------------------
        // Prop calculations

        const length = size[0]
        const width = size[1]

        let derivedBeamLevels = beamLevels
        if (!beamLevels) {
            derivedBeamLevels = [
                postThickness,
                width,
            ]
        }

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
            positionType,
        }

        /** Various dimensions for model */
        const modelDims = {
            size,
            postThickness,
            beamLevels: derivedBeamLevels,
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


        return modelProperties
    }


    //------------------------------------------------------------
    // Secondary Modelling Functions
    //------------------------------------------------------------


    //------------------------------------------------------------
    // Primary Modelling Functions
    //------------------------------------------------------------


    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.size - 2D coord (length, width)
     * @param {number} opts.postThickness
     * @param {number[]} opts.beamLevels - describes top points for beams
     * @param {number} opts.dovetailLength
     * @param {string} opts.type
     * @param {string} opts.positionType
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const interlockDovetailFrame = (opts) => {
        const initOpts = interlockDovetailFrameOpts(opts)
        const modelProperties = interlockDovetailFrameProps(initOpts)

        const {
            type,
            positionType,
        } = modelProperties.opts

        const {
            size,
            postThickness,
            beamLevels,
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

        const pBeam = polyPost({
            length: panelLength,
            thickness: postThickness,
            type: 'basic',
        })[0]

        const sidePostType = positionType == 'face' ? 'male' : 'female'
        const sidePostOpts = {
            length: width,
            thickness: postThickness,
            type: 'dovetail',
            dovetailOpts: {
                length: dovetailLength,
                type: sidePostType,
            },
            fitGap,
        }
        const pPost = polyPost(sidePostOpts)[0]

        //----------------------------------------
        // Assembling sub-components

        const rightPt = [length / 2 - postThickness, 0, 0]
        const leftPt = [length / -2 + postThickness, 0, 0]

        // join left side post to body
        const leftPost = align(
            {
                modes: ['max', 'min', 'min'],
                relativeTo: leftPt,
            },
            rotate([0, 0, TAU / 4], pPost)
        )

        // join right side post to body
        const rightPost = align(
            {
                modes: ['min', 'min', 'min'],
                relativeTo: rightPt,
            },
            rotate([0, 0, TAU / -4], pPost)
        )

        let panelAssembly = leftPost

        console.log(beamLevels)
        const beams = beamLevels.map(beamTopLevel => {
            return align({
                modes: ['center', 'max', 'min'],
                relativeTo: [0, beamTopLevel, 0],
            }, pBeam)
        })

        panelAssembly = union(
            panelAssembly,
            ...beams,
            rightPost,
        )

        const mainModel = position.ctr(panelAssembly)

        const modelParts = {
            mainModel,
            beam: pBeam,
            post: pPost,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return interlockDovetailFrame
}

module.exports = {
    init: interlockDovetailFrameInit
}
