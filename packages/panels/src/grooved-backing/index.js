"use strict"

const groovedBackingInit = ({ jscad, swcadJs }) => {
    const {
        cuboid,
    } = jscad.primitives

    const {
        align,
    } = jscad.transforms

    const {
        union,
        subtract,
    } = jscad.booleans

    const {
        standards,
    } = swcadJs.data

    const {
        math,
        position,
    } = swcadJs.calcs

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
    const groovedBackingDefaults = () => {
        const interfaceThickness = standards.INTERFACE_THICKNESS
        const fitGap = standards.FIT_GAP

        const defaultValues = {
            constants: {
                panelTypes: ['solid', 'mesh', 'lattice', 'minimal'],
            },
            opts: {
                type: 'wrap',
                panelType: 'solid',
                hasBottomLip: false,
            },
            dims: {
                supportSpan: math.inchesToMm(2),
                backingwidth: math.inchesToMm(4),
                thickness: interfaceThickness,
                postThickness: 5,
                fitGap,
            },
            points: {},
            components: {},
            types: {
                wrap: { id: 'wrap', desc: 'Backing w/ groove completely wrapping around beam.' },
                flush: { id: 'flush', desc: 'Backing w/ groove partially wrapping around beam, flush with corner.' },
                flush: { id: 'lip', desc: 'Backing w/ groove partially wrapping around beam.' },
            },
        }

        const defaultOpts = {
            supportSpan: defaultValues.dims.supportSpan,
            backingwidth: defaultValues.dims.backingwidth,
            thickness: defaultValues.dims.thickness,
            postThickness: defaultValues.dims.postThickness,
            type: defaultValues.opts.type,
            panelType: defaultValues.opts.panelType,
            hasBottomLip: defaultValues.opts.hasBottomLip,
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
    const groovedBackingOpts = (opts) => {
        const defaults = groovedBackingDefaults()

        // User options
        const {
            supportSpan = defaults.opts.supportSpan,
            backingwidth = defaults.opts.backingwidth,
            thickness = defaults.opts.thickness,
            postThickness = defaults.opts.postThickness,
            type = defaults.opts.type,
            panelType = defaults.opts.panelType,
            hasBottomLip = defaults.opts.hasBottomLip,
            fitGap = defaults.opts.fitGap,
        } = opts

        const initOpts = {
            supportSpan,
            backingwidth,
            thickness,
            postThickness,
            type,
            panelType,
            hasBottomLip,
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
    const groovedBackingProps = (opts) => {
        const defaults = groovedBackingDefaults()

        const {
            supportSpan,
            backingwidth,
            thickness,
            postThickness,
            type,
            panelType,
            hasBottomLip,
            fitGap,
        } = opts

        //----------------------------------------
        // Prop calculations

        const lipExtWidth = postThickness / 2
        let panelExtensionWidth = 0
        if (type == 'wrap') {
            const wrapExtensionWidth = thickness + fitGap
            panelExtensionWidth = wrapExtensionWidth * 2
        } else if (type == 'lip') {
            const panelExtDiff = postThickness - lipExtWidth
            panelExtensionWidth = panelExtDiff * -2
        }

        const panelSize = [
            supportSpan + panelExtensionWidth,
            backingwidth,
        ]
        const panelLength = panelSize[0]
        const panelWidth = panelSize[1]

        const grooveWidth = postThickness + fitGap
        const grooveHeight = postThickness * 0.3333
        const grooveWallHeight = grooveHeight + thickness



        //----------------------------------------
        // Preparing Model Properties, Dimensions

        /** Constant values for model */
        const modelConstants = defaults.vals.constants

        /** Derived user options for the model */
        const modelOpts = {
            type,
            panelType,
            hasBottomLip,
        }

        /** Various dimensions for model */
        const modelDims = {
            supportSpan,
            backingwidth,
            thickness,
            postThickness,
            fitGap,
            supportSpan,
            // footingWidth,
            panelSize,
            panelLength,
            panelWidth,
            grooveWidth,
            grooveHeight,
            grooveWallHeight,
            lipExtWidth,
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


    const exteriorGrooveWalls = (opts) => {
        const {
            thickness,
            panelLength,
            panelWidth,
            grooveWallHeight,
        } = opts

        const extGrooveWallY = cuboid({
            size: [
                thickness,
                panelWidth,
                grooveWallHeight,
            ]
        })

        const extWalls = union(
            align({
                modes: ['min', 'center', 'center'],
                relativeTo: [panelLength / -2, 0, 0]
            }, extGrooveWallY),
            align({
                modes: ['max', 'center', 'center'],
                relativeTo: [panelLength / 2, 0, 0]
            }, extGrooveWallY),
        )

        return extWalls
    }

    const interiorGrooveWalls = (opts) => {
        const {
            thickness,
            postThickness,
            fitGap,
            supportSpan,
            backingwidth,
            grooveWallHeight,
            hasBottomLip,
            lipExtWidth,
        } = opts

        const intMargin = postThickness + fitGap
        const innerFtgEdgeDistX = supportSpan - (intMargin * 2)

        const intGrooveWallY = cuboid({
            size: [
                thickness,
                backingwidth,
                grooveWallHeight,
            ]
        })

        const intWalls = [
            align({
                modes: ['min', 'center', 'center'],
                relativeTo: [innerFtgEdgeDistX / -2, 0, 0]
            }, intGrooveWallY),
            align({
                modes: ['max', 'center', 'center'],
                relativeTo: [innerFtgEdgeDistX / 2, 0, 0]
            }, intGrooveWallY),
        ]

        if (hasBottomLip) {
            let edgeLip = cuboid({
                size: [
                    innerFtgEdgeDistX,
                    thickness,
                    thickness + lipExtWidth,
                ]
            })
            edgeLip = align({
                modes: ['center', 'min', 'center'],
                relativeTo: [0, backingwidth / -2, 0]
            }, edgeLip)
            intWalls.push(edgeLip)
        }


        const intWallAssembly = union(...intWalls)

        return intWallAssembly
    }


    //------------------------------------------------------------
    // Primary Modelling Functions
    //------------------------------------------------------------


    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.supportSpan - distance between bearing surfaces' external edges
     * @param {number[]} opts.backingwidth - width of backing panel
     * @param {number} opts.thickness - thickness of this panel
     * @param {number} opts.postThickness - thickness of post/beam that fits against this panel
     * @param {string} opts.type - one of ['wrap', 'flush']
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const groovedBacking = (opts) => {
        const defaults = groovedBackingDefaults()
        const initOpts = groovedBackingOpts(opts)
        const modelProperties = groovedBackingProps(initOpts)

        const {
            type,
            panelType,
            hasBottomLip,
        } = modelProperties.opts

        const {
            thickness,
            postThickness,
            fitGap,
            supportSpan,
            backingwidth,
            footingWidth,
            panelSize,
            panelLength,
            panelWidth,
            grooveWallHeight,
            lipExtWidth,
        } = modelProperties.dims

        //----------------------------------------
        // Initializing sub-components

        const polyPanelOpts = {
            size: panelSize,
            thickness,
            type: panelType,
        }

        const basePanel = polyPanel(polyPanelOpts)[0]
        let intGrooveWalls = interiorGrooveWalls({
            thickness,
            postThickness,
            fitGap,
            supportSpan,
            backingwidth,
            footingWidth,
            grooveWallHeight,
            hasBottomLip,
            lipExtWidth,
        })
        let extGrooveWalls = exteriorGrooveWalls({
            thickness,
            panelLength,
            panelWidth,
            grooveWallHeight,
        })

        //----------------------------------------
        // Assembling sub-components

        let groovedBackingAssembly = union(
            position.ctrMin(basePanel),
            position.ctrMin(intGrooveWalls),
        )

        if (type == 'wrap') {
            groovedBackingAssembly = union(
                position.ctrMin(extGrooveWalls),
                position.ctrMin(groovedBackingAssembly),
            )
        }

        const mainModel = groovedBackingAssembly

        const modelParts = {
            mainModel,
            extGrooveWalls,
            intGrooveWalls,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return groovedBacking
}

module.exports = {
    init: groovedBackingInit
}
