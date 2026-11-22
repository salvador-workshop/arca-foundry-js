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
                wrap: { id: 'wrap', desc: 'Shelf w/ groove completely wrapping around beam.' },
                flush: { id: 'flush', desc: 'Shelf w/ groove partially wrapping around beam.' },
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

        const wrapExtensionWidth = thickness + fitGap
        const panelExtensionWidth = type == 'flush' ? 0 : wrapExtensionWidth * 2
        const panelSize = [
            supportSize[0] + panelExtensionWidth,
            supportSize[1] + panelExtensionWidth,
        ]
        const panelLength = panelSize[0]
        const panelWidth = panelSize[1]

        const grooveWidth = postThickness + fitGap
        const grooveHeight = postThickness * 0.3333
        const grooveWallHeight = grooveHeight + thickness

        const cornerEdgeAdj = type == 'flush' ? 0 : thickness
        const cornerFitAdj = type == 'flush' ? fitGap : fitGap * 2

        const cornerCutX = cornerSize[0] + cornerFitAdj + cornerEdgeAdj
        const cornerCutY = cornerSize[1] + cornerFitAdj + cornerEdgeAdj
        const cornerCutAdj = fitGap / 32

        const cornerTopRight = [
            panelLength / 2,
            panelWidth / 2,
            0
        ]

        const cornerBottomRight = [
            panelLength / 2,
            panelWidth / -2,
            0
        ]

        const cornerBottomLeft = [
            panelLength / -2,
            panelWidth / -2,
            0
        ]

        const cornerTopLeft = [
            panelLength / -2,
            panelWidth / 2,
            0
        ]


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
            cornerSize,
            footingLength,
            footingWidth,
            panelSize,
            panelLength,
            panelWidth,
            grooveWidth,
            grooveHeight,
            grooveWallHeight,
            cornerEdgeAdj,
            cornerFitAdj,
            cornerCutX,
            cornerCutY,
            cornerCutAdj,
        }

        /** Various key points for model */
        const modelPoints = {
            cornerTopRight,
            cornerBottomRight,
            cornerBottomLeft,
            cornerTopLeft,
        }

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

        const intMargin = postThickness + fitGap
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

        const intMargin = postThickness + fitGap
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
            grooveWallHeight,
            cornerCutX,
            cornerCutY,
            cornerTopRight,
            cornerBottomRight,
            cornerBottomLeft,
            cornerTopLeft,
            cornerCutAdj
        } = opts

        const cornerCutaway = cuboid({
            size: [
                cornerCutX,
                cornerCutY,
                grooveWallHeight * 4,
            ]
        })

        const cutaways = [
            align({
                modes: ['max', 'max', 'center'],
                relativeTo: [
                    cornerTopRight[0] + cornerCutAdj,
                    cornerTopRight[1] + cornerCutAdj,
                    0
                ],
            }, cornerCutaway),
            align({
                modes: ['max', 'min', 'center'],
                relativeTo: [
                    cornerBottomRight[0] + cornerCutAdj,
                    cornerBottomRight[1] - cornerCutAdj,
                    0
                ],
            }, cornerCutaway),
            align({
                modes: ['min', 'min', 'center'],
                relativeTo: [
                    cornerBottomLeft[0] - cornerCutAdj,
                    cornerBottomLeft[1] - cornerCutAdj,
                    0
                ],
            }, cornerCutaway),
            align({
                modes: ['min', 'max', 'center'],
                relativeTo: [
                    cornerTopLeft[0] - cornerCutAdj,
                    cornerTopLeft[1] + cornerCutAdj,
                    0
                ],
            }, cornerCutaway),
        ]

        return union(...cutaways)
    }

    const cornerCutawayReinforcementBlanks = (opts) => {
        const {
            thickness,
            cornerCutX,
            cornerCutY,
            cornerTopRight,
            cornerBottomRight,
            cornerBottomLeft,
            cornerTopLeft,
        } = opts

        const cornerReinforcementBlank = (cuboid({
            size: [
                cornerCutX + thickness,
                cornerCutY + thickness,
                thickness,
            ]
        }))

        const cutawayReinforcementBlanks = [
            align({
                modes: ['max', 'max', 'min'],
                relativeTo: cornerTopRight,
            }, cornerReinforcementBlank),
            align({
                modes: ['max', 'min', 'min'],
                relativeTo: cornerBottomRight,
            }, cornerReinforcementBlank),
            align({
                modes: ['min', 'min', 'min'],
                relativeTo: cornerBottomLeft,
            }, cornerReinforcementBlank),
            align({
                modes: ['min', 'max', 'min'],
                relativeTo: cornerTopLeft,
            }, cornerReinforcementBlank),
        ]

        return union(...cutawayReinforcementBlanks)
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
            thickness,
            postThickness,
            fitGap,
            cornerSize,
            footingLength,
            footingWidth,
            panelSize,
            panelLength,
            panelWidth,
            grooveWallHeight,
            cornerEdgeAdj,
            cornerFitAdj,
            cornerCutX,
            cornerCutY,
            cornerCutAdj,
        } = modelProperties.dims

        const {
            cornerTopRight,
            cornerBottomRight,
            cornerBottomLeft,
            cornerTopLeft,
        } = modelProperties.points

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
            if (['mesh', 'lattice', 'minimal'].includes(panelType)) {
                const cornerReinfBlanks = cornerCutawayReinforcementBlanks({
                    thickness,
                    cornerCutX,
                    cornerCutY,
                    cornerTopRight,
                    cornerBottomRight,
                    cornerBottomLeft,
                    cornerTopLeft,
                })
                groovedShelfAssembly = union(
                    groovedShelfAssembly,
                    cornerReinfBlanks
                )
            }
            const cornCutaways = cornerCutaways({
                grooveWallHeight,
                cornerCutX,
                cornerCutY,
                cornerTopRight,
                cornerBottomRight,
                cornerBottomLeft,
                cornerTopLeft,
                cornerCutAdj,
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
