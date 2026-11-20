"use strict"

const groovedShelfInit = ({ jscad, swcadJs }) => {
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
    const groovedShelfDefaults = () => {
        const interfaceThickness = standards.INTERFACE_THICKNESS
        const fitGap = standards.FIT_GAP

        const defaultValues = {
            constants: {
                panelTypes: ['solid', 'mesh', 'lattice', 'minimal'],
            },
            opts: {
                type: 'wrap',
                panelType: 'solid',
                isOpen: false,
                hasCutCorners: false,
            },
            dims: {
                supportSize: [
                    math.inchesToMm(2),
                    math.inchesToMm(4),
                ],
                thickness: interfaceThickness,
                postThickness: 5,
                fitGap,
                cornerSize: [5, 7.5],
            },
            points: {},
            components: {},
            types: {
                wrap: { id: 'wrap', desc: 'Base w/ groove completely wrapping around beam.' },
                flush: { id: 'flush', desc: 'Base w/ groove partially wrapping around beam.' },
            },
        }

        const defaultOpts = {
            supportSize: defaultValues.dims.supportSize,
            thickness: defaultValues.dims.thickness,
            postThickness: defaultValues.dims.postThickness,
            type: defaultValues.opts.type,
            panelType: defaultValues.opts.panelType,
            fitGap: defaultValues.dims.fitGap,
            isOpen: defaultValues.opts.isOpen,
            hasCutCorners: defaultValues.opts.hasCutCorners,
            cornerSize: defaultValues.dims.cornerSize,
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
    const groovedShelfOpts = (opts) => {
        const defaults = groovedShelfDefaults()

        // User options
        const {
            supportSize = defaults.opts.supportSize,
            thickness = defaults.opts.thickness,
            postThickness = defaults.opts.postThickness,
            type = defaults.opts.type,
            panelType = defaults.opts.panelType,
            fitGap = defaults.opts.fitGap,
            isOpen = defaults.opts.isOpen,
            hasCutCorners = defaults.opts.hasCutCorners,
            cornerSize = defaults.opts.cornerSize,
        } = opts

        const initOpts = {
            supportSize,
            thickness,
            postThickness,
            type,
            panelType,
            fitGap,
            isOpen,
            hasCutCorners,
            cornerSize,
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
    const groovedShelfProps = (opts) => {
        const defaults = groovedShelfDefaults()

        const {
            supportSize,
            thickness,
            postThickness,
            type,
            panelType,
            fitGap,
            isOpen,
            hasCutCorners,
            cornerSize,
        } = opts

        //----------------------------------------
        // Prop calculations

        const footingLength = supportSize[0]
        const footingWidth = supportSize[1]

        const wrapExtensionWidth = thickness + (fitGap / 2)
        const panelExtensiontWidth = type == 'flush' ? 0 : wrapExtensionWidth * 2
        const panelSize = [
            supportSize[0] + panelExtensiontWidth,
            supportSize[1] + panelExtensiontWidth,
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
            isOpen,
            hasCutCorners,
        }

        /** Various dimensions for model */
        const modelDims = {
            supportSize,
            thickness,
            postThickness,
            fitGap,
            footingLength,
            footingWidth,
            panelSize,
            panelLength,
            panelWidth,
            grooveWidth,
            grooveHeight,
            grooveWallHeight,
            cornerSize,
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

        const extGrooveWallX = cuboid({
            size: [
                panelLength,
                thickness,
                grooveWallHeight,
            ]
        })

        const extGrooveWallY = cuboid({
            size: [
                thickness,
                panelWidth,
                grooveWallHeight,
            ]
        })

        const extWalls = union(
            align({
                modes: ['center', 'min', 'center'],
                relativeTo: [0, panelWidth / -2, 0]
            }, extGrooveWallX),
            align({
                modes: ['min', 'center', 'center'],
                relativeTo: [panelLength / -2, 0, 0]
            }, extGrooveWallY),
            align({
                modes: ['center', 'max', 'center'],
                relativeTo: [0, panelWidth / 2, 0]
            }, extGrooveWallX),
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
            footingLength,
            footingWidth,
            grooveWallHeight,
        } = opts

        const intMargin = postThickness + (fitGap / 2)
        const innerFtgEdgeDistX = footingLength - (intMargin * 2)
        const innerFtgEdgeDistY = footingWidth - (intMargin * 2)

        const intGrooveWallX = cuboid({
            size: [
                innerFtgEdgeDistX,
                thickness,
                grooveWallHeight,
            ]
        })

        const intGrooveWallY = cuboid({
            size: [
                thickness,
                innerFtgEdgeDistY,
                grooveWallHeight,
            ]
        })

        const intWalls = union(
            align({
                modes: ['center', 'min', 'center'],
                relativeTo: [0, innerFtgEdgeDistY / -2, 0]
            }, intGrooveWallX),
            align({
                modes: ['min', 'center', 'center'],
                relativeTo: [innerFtgEdgeDistX / -2, 0, 0]
            }, intGrooveWallY),
            align({
                modes: ['center', 'max', 'center'],
                relativeTo: [0, innerFtgEdgeDistY / 2, 0]
            }, intGrooveWallX),
            align({
                modes: ['max', 'center', 'center'],
                relativeTo: [innerFtgEdgeDistX / 2, 0, 0]
            }, intGrooveWallY),
        )

        return intWalls
    }

    const centreCutaway = (opts) => {
        const {
            thickness,
            postThickness,
            fitGap,
            footingLength,
            footingWidth,
            grooveWallHeight,
        } = opts

        const intMargin = postThickness + (fitGap / 2)
        const ctrEdgeMargin = intMargin + thickness

        const ctrEdgeDistX = footingLength - (ctrEdgeMargin * 2)
        const ctrEdgeDistY = footingWidth - (ctrEdgeMargin * 2)

        return cuboid({
            size: [
                ctrEdgeDistX,
                ctrEdgeDistY,
                grooveWallHeight * 4,
            ]
        })
    }

    const cornerCutaways = (opts) => {
        const {
            thickness,
            fitGap,
            panelLength,
            panelWidth,
            grooveWallHeight,
            cornerSize,
        } = opts

        const cornerCutX = cornerSize[0] + fitGap + thickness
        const cornerCutY = cornerSize[1] + fitGap + thickness

        const cornerCutaway = cuboid({
            size: [
                cornerCutX,
                cornerCutY,
                grooveWallHeight * 4,
            ]
        })

        const cutAdj = fitGap / 8
        const cutaways = [
            align({
                modes: ['max', 'max', 'center'],
                relativeTo: [
                    panelLength / 2 + cutAdj,
                    panelWidth / 2 + cutAdj,
                    0
                ],
            }, cornerCutaway),
            align({
                modes: ['max', 'min', 'center'],
                relativeTo: [
                    panelLength / 2 + cutAdj,
                    panelWidth / -2 - cutAdj,
                    0
                ],
            }, cornerCutaway),
            align({
                modes: ['min', 'min', 'center'],
                relativeTo: [
                    panelLength / -2 - cutAdj,
                    panelWidth / -2 - cutAdj,
                    0
                ],
            }, cornerCutaway),
            align({
                modes: ['min', 'max', 'center'],
                relativeTo: [
                    panelLength / -2 - cutAdj,
                    panelWidth / 2 + cutAdj,
                    0
                ],
            }, cornerCutaway),
        ]

        return union(...cutaways)
    }


    //------------------------------------------------------------
    // Primary Modelling Functions
    //------------------------------------------------------------


    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.supportSize - 2D coord (length, width) of bearing surfaces
     * @param {number} opts.thickness - thickness of this panel
     * @param {number} opts.postThickness - thickness of post/beam that fits against this panel
     * @param {string} opts.type - one of ['wrap', 'flush']
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const groovedShelf = (opts) => {
        const defaults = groovedShelfDefaults()
        const initOpts = groovedShelfOpts(opts)
        const modelProperties = groovedShelfProps(initOpts)

        const {
            type,
            panelType,
            isOpen,
            hasCutCorners,
        } = modelProperties.opts

        const {
            supportSize,
            thickness,
            postThickness,
            fitGap,
            footingLength,
            footingWidth,
            panelSize,
            panelLength,
            panelWidth,
            grooveWidth,
            grooveHeight,
            grooveWallHeight,
            cornerSize,
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
            footingLength,
            footingWidth,
            grooveWallHeight,
        })
        let extGrooveWalls = exteriorGrooveWalls({
            thickness,
            panelLength,
            panelWidth,
            grooveWallHeight,
        })

        //----------------------------------------
        // Assembling sub-components

        let groovedShelfAssembly = union(
            position.ctrMin(basePanel),
            position.ctrMin(intGrooveWalls),
        )

        if (type == 'wrap') {
            groovedShelfAssembly = union(
                position.ctrMin(extGrooveWalls),
                position.ctrMin(groovedShelfAssembly),
            )
        }

        if (isOpen) {
            const ctrCutaway = centreCutaway({
                thickness,
                postThickness,
                fitGap,
                footingLength,
                footingWidth,
                grooveWallHeight,
            })
            groovedShelfAssembly = subtract(
                groovedShelfAssembly,
                ctrCutaway
            )
        }

        if (hasCutCorners) {
            const cornCutaways = cornerCutaways({
                thickness,
                fitGap,
                panelLength,
                panelWidth,
                grooveWallHeight,
                cornerSize,
            })
            groovedShelfAssembly = subtract(
                groovedShelfAssembly,
                cornCutaways
            )
        }

        const mainModel = groovedShelfAssembly

        const modelParts = {
            mainModel,
            extGrooveWalls,
            intGrooveWalls,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return groovedShelf
}

module.exports = {
    init: groovedShelfInit
}
