"use strict"

const interlockDovetailPanelInit = ({ jscad, swcadJs }) => {
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

    const polyPanelModule = require('../poly-panel/index.js')
    const polyPanel = polyPanelModule.init({ jscad, swcadJs })

    const interlockDovetailFrameModule = require('../interlock-dovetail-frame/index.js')
    const interlockDovetailFrame = interlockDovetailFrameModule.init({ jscad, swcadJs })


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
    const interlockDovetailPanelDefaults = () => {
        const interfaceThickness = standards.INTERFACE_THICKNESS
        const fitGap = standards.FIT_GAP

        const defaultValues = {
            constants: {
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
    const interlockDovetailPanelOpts = (opts) => {
        const defaults = interlockDovetailPanelDefaults()

        // User options
        const {
            size = defaults.opts.size,
            panelThickness = defaults.opts.panelThickness,
            postThickness = defaults.opts.postThickness,
            panelLevels,
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
            panelLevels,
            dovetailLength,
            type,
            bodyType,
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
    const interlockDovetailPanelProps = (opts) => {
        const defaults = interlockDovetailPanelDefaults()

        const {
            size,
            panelThickness,
            postThickness,
            panelLevels,
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

        let derivedPanelLevels = panelLevels
        if (!panelLevels) {
            derivedPanelLevels = [
                [
                    0,
                    width,
                ]
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
            bodyType,
            positionType,
        }

        /** Various dimensions for model */
        const modelDims = {
            size,
            panelThickness,
            postThickness,
            panelLevels: derivedPanelLevels,
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
     * @param {number} opts.panelThickness
     * @param {number} opts.postThickness
     * @param {number[]} opts.panelLevels - describes top and bottom points for panels.
     * @param {number} opts.dovetailLength
     * @param {string} opts.type
     * @param {string} opts.bodyType
     * @param {string} opts.positionType
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const interlockDovetailPanel = (opts) => {
        const initOpts = interlockDovetailPanelOpts(opts)
        const modelProperties = interlockDovetailPanelProps(initOpts)

        const {
            type,
            bodyType,
            positionType,
        } = modelProperties.opts

        const {
            size,
            panelThickness,
            postThickness,
            panelLevels,
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

        const beamLevels = []
        panelLevels.forEach(panelLevelPair => {
            beamLevels.push(panelLevelPair[0] + postThickness)
            beamLevels.push(panelLevelPair[1])
        })
        const interlockDovetailFrameOpts = {
            size,
            postThickness,
            beamLevels,
            dovetailLength,
            positionType,
            fitGap,
        }
        let pFrame = interlockDovetailFrame({
            ...interlockDovetailFrameOpts
        })[0]
        pFrame = align({
            modes: ['center', 'min', 'min'],
        }, pFrame)

        const panels = panelLevels.map(panelLevelPair => {
            const panelHt = panelLevelPair[1] - panelLevelPair[0] - (postThickness * 2)
            const polyPanelOpts = {
                size: [
                    panelLength,
                    panelHt
                ],
                thickness: panelThickness,
                type: bodyType,
            }
            const pPanel = polyPanel(polyPanelOpts)[0]

            return align({
                modes: ['center', 'max', 'min'],
                relativeTo: [0, panelLevelPair[1] - postThickness, 0],
            }, pPanel)
        })

        //----------------------------------------
        // Assembling sub-components

        let panelAssembly = pFrame

        panelAssembly = union(
            panelAssembly,
            ...panels,
        )

        const mainModel = position.ctr(panelAssembly)

        const modelParts = {
            mainModel,
            frame: pFrame,
            panels,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return interlockDovetailPanel
}

module.exports = {
    init: interlockDovetailPanelInit
}
