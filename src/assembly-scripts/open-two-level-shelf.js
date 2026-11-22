"use strict"

const jscad = require('@jscad/modeling')
const swcadJs = require('swcad-js').init({ jscad });

const {
    math,
} = swcadJs.calcs

const projectConfigContent = require('./config.json');
const projectConfig = projectConfigContent[0]

const panelsModule = require('panels')
const footingsModule = require('footings')

const {
    interlockDovetailFrame: interlockDovetailFrameModule,
    groovedShelf: groovedShelfModule,
} = panelsModule

const {
    rectangularPostFoot: rectangularPostFootModule,
} = footingsModule

const interlockDovetailFrame = interlockDovetailFrameModule.init({ jscad, swcadJs })
const groovedShelf = groovedShelfModule.init({ jscad, swcadJs })
const rectangularPostFoot = rectangularPostFootModule.init({ jscad, swcadJs })

// ----------------------------------------
// Model Input Parameters
// ----------------------------------------


const getParameterDefinitions = () => {
    // Initialize parameters
    const params = [
        { name: 'length', caption: '', type: 'float', initial: math.inchesToMm(5) },
        { name: 'width', caption: '', type: 'float', initial: math.inchesToMm(4) },
        { name: 'height', caption: '', type: 'float', initial: math.inchesToMm(3) },
        { name: 'panelThickness', caption: '', type: 'float', initial: 1.3333 },
        { name: 'postThickness', caption: '', type: 'float', initial: 4 },
        { name: 'dovetailLength', caption: '', type: 'float', initial: math.inchesToMm(1 / 2) },
        { name: 'panelType', caption: '', type: 'text', initial: 'minimal' },
        { name: 'fitGap', caption: '', type: 'float', initial: math.inchesToMm(1 / 128) },
    ];

    let configParams = {}
    if (projectConfig && projectConfig.parameters) {
        configParams = projectConfig.parameters
    }
    const configParamKeys = Object.keys(configParams)

    // override parameters with values from "config.json"
    const overridenParams = params.map(paramObj => {
        const newParamObj = {
            ...paramObj,
        }
        if (configParamKeys.includes(paramObj.name)) {
            newParamObj.initial = configParams[paramObj.name]
        }
        return newParamObj
    })

    return overridenParams;
}


// ----------------------------------------
// Model Prep
// ----------------------------------------


/**
 * Main function to be rendered by JSCAD
 * @returns `geom3` or `geom3[]`
 */
function main(params) {
    console.log('[OPEN TWO-LEVEL SHELF] input parameters', params)
    const {
        length,
        width,
        height,
        panelThickness,
        postThickness,
        dovetailLength,
        panelType,
        fitGap,
    } = params

    // ----------------------------------------
    // Setting up model properties

    const facePanelWidth = length
    const sidePanelWidth = width - postThickness
    const postSize = [postThickness, postThickness * 1.5]

    // ----------------------------------------
    // Setting up face/side panels

    const interDovetailFrameOpts = {
        panelThickness,
        postThickness,
        dovetailLength,
        bodyType: panelType,
        fitGap,
    }

    const facePanel = interlockDovetailFrame({
        ...interDovetailFrameOpts,
        size: [facePanelWidth, height],
        beamLevels: [height / 2, height],
        positionType: 'face',
    })[0]

    const sidePanel = interlockDovetailFrame({
        ...interDovetailFrameOpts,
        size: [sidePanelWidth, height],
        beamLevels: [height / 2, height],
        positionType: 'side',
    })[0]

    // ----------------------------------------
    // Setting up shelves

    const groovedShelfOpts = {
        supportSize: [length, width],
        thickness: panelThickness,
        postThickness,
        panelType,
        type: 'wrap',
        fitGap,
    }

    const topShelf = groovedShelf(groovedShelfOpts)[0]
    const midShelf = groovedShelf({
        ...groovedShelfOpts,
        hasCutCorners: true,
        cornerSize: postSize,
    })[0]

    // ----------------------------------------
    // Setting up feet

    const rectPostFootOpts = {
        postSize,
        sleeveHeight: 3,
        baseExtWidth: 3,
        thickness: panelThickness,
        fitGap,
    }

    const foot = rectangularPostFoot(rectPostFootOpts)[0]

    return [
        facePanel,
        sidePanel,
        topShelf,
        midShelf,
        foot,
    ]
}


module.exports = {
    main,
    getParameterDefinitions,
}
