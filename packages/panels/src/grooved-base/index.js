"use strict"

const groovedBaseInit = ({ jscad, swcadJs }) => {
    const {
        cuboid,
    } = jscad.primitives

    const {
        align,
    } = jscad.transforms

    const {
        union,
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


    //==============================================================================


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof newModelParent
     * @access private
     */
    const groovedBaseDefaults = () => {
        const interfaceThickness = standards.INTERFACE_THICKNESS
        const fitGap = standards.FIT_GAP

        const defaultValues = {
            constants: {
                panelTypes: ['solid', 'mesh', 'lattice', 'minimal'],
            },
            opts: {
                type: 'wrap',
                panelType: 'solid',
            },
            dims: {
                footingSize: [
                    math.inchesToMm(2),
                    math.inchesToMm(4),
                ],
                thickness: interfaceThickness,
                postThickness: 5,
                fitGap,
            },
            points: {},
            components: {},
            types: {
                wrap: { id: 'wrap', desc: 'Base w/ groove completely wrapping around beam.' },
                flush: { id: 'flush', desc: 'Base w/ groove partially wrapping around beam.' },
            },
        }

        const defaultOpts = {
            footingSize: defaultValues.dims.footingSize,
            thickness: defaultValues.dims.thickness,
            postThickness: defaultValues.dims.postThickness,
            type: defaultValues.opts.type,
            panelType: defaultValues.opts.panelType,
            fitGap: defaultValues.dims.fitGap,
        }

        return {
            opts: defaultOpts,
            vals: defaultValues,
        }
    }


    //------------------------------------------------------------------------------


    /**
     * Initializes options with user input
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelParent
     * @access private
     */
    const groovedBaseOpts = (opts) => {
        const defaults = groovedBaseDefaults()
        console.log('groovedBaseOpts() -- opts', opts)

        // User options
        const {
            footingSize = defaults.opts.footingSize,
            thickness = defaults.opts.thickness,
            postThickness = defaults.opts.postThickness,
            type = defaults.opts.type,
            panelType = defaults.opts.panelType,
            fitGap = defaults.opts.fitGap,
        } = opts

        const initOpts = {
            footingSize,
            thickness,
            postThickness,
            type,
            panelType,
            fitGap,
        }

        console.log('groovedBaseOpts() -- initOpts', initOpts)

        return initOpts
    }


    //------------------------------------------------------------------------------


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelParent
     * @access private
     */
    const groovedBaseProps = (opts) => {
        const defaults = groovedBaseDefaults()
        console.log('groovedBaseProps() -- prop opts', opts)

        const {
            footingSize,
            thickness,
            postThickness,
            type,
            panelType,
            fitGap,
        } = opts

        /* ----------------------------------------
        * Prop calculations
        * ------------------------------------- */

        const footingLength = footingSize[0]
        const footingWidth = footingSize[1]

        const wrapExtensionWidth = thickness + (fitGap / 2)
        const panelExtensiontWidth = type == 'flush' ? 0 : wrapExtensionWidth * 2
        const panelSize = [
            footingSize[0] + panelExtensiontWidth,
            footingSize[1] + panelExtensiontWidth,
        ]
        const panelLength = panelSize[0]
        const panelWidth = panelSize[1]

        const grooveWidth = postThickness + fitGap
        const grooveHeight = postThickness * 0.3333
        const grooveWallHeight = grooveHeight + thickness

        /* ----------------------------------------
        * Preparing Model Properties, Dimensions
        * ------------------------------------- */

        /** Constant values for model */
        const modelConstants = defaults.vals.constants

        /** Derived user options for the model */
        const modelOpts = {
            type,
            panelType,
        }

        /** Various dimensions for model */
        const modelDims = {
            footingSize,
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
        }

        /** Various key points for model */
        const modelPoints = defaults.vals.points

        /** Components used by model */
        const modelComponents = defaults.vals.components

        /* ---------------------------------------------
        *  Model Properties
        * ----------------------------------------------
        * Properties accessible to all model functions.
        * --------------------------------------------- */

        const modelProperties = {
            constants: modelConstants,
            opts: modelOpts,
            dims: modelDims,
            points: modelPoints,
            components: modelComponents,
        }

        console.log('groovedBaseProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------------------------

    /* ----------------------------------------
    * Modelling, Component/Assembly Modules
    * ------------------------------------- */

    /** Sub-component 01 */
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

    /** Sub-component 02 */
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

    /**
     * Generates a new model
     * @param {Object} opts - Options for the model
     * @param {number[]} opts.footingSize - 2D coord (length, width) of bearing surfaces
     * @param {number} opts.thickness - thickness of this panel
     * @param {number} opts.postThickness - thickness of post/beam that fits against this panel
     * @param {string} opts.type - one of ['wrap', 'flush']
     * @param {number} opts.fitGap
     * @returns {Array.<(geom3|Object.<string, geom3>|Object.<string, any>)>} Array with model, parts, and properties
     * @memberof newModelParent
     */
    const groovedBase = (opts) => {
        const defaults = groovedBaseDefaults()
        const initOpts = groovedBaseOpts(opts)
        const modelProperties = groovedBaseProps(initOpts)

        const {
            type,
            panelType,
        } = modelProperties.opts

        const {
            footingSize,
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
        } = modelProperties.dims

        /* ----------------------------------------
         * Outputs
         * ------------------------------------- */

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

        let groovedBaseAssembly = union(
            position.ctrMin(basePanel),
            position.ctrMin(intGrooveWalls),
        )

        if (type == 'wrap') {
            groovedBaseAssembly = union(
                position.ctrMin(extGrooveWalls),
                position.ctrMin(groovedBaseAssembly),
            )
        }

        const mainModel = groovedBaseAssembly

        const modelParts = {
            mainModel,
            extGrooveWalls,
            intGrooveWalls,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return groovedBase
}

module.exports = {
    init: groovedBaseInit
}
