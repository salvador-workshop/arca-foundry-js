"use strict"

const jscad = require('@jscad/modeling')

const {
    cuboid, 
    cylinder, 
} = jscad.primitives

const {
    subtract,
    union,
 } = jscad.booleans

const {
    align,
 } = jscad.transforms

const swcadJs = require('swcad-js').init({ jscad });

const {
    math,
} = swcadJs.calcs

const projectConfigContent = require('./config.json');
const projectConfig = projectConfigContent[0]

const panelsModule = require('panels')

const {
    interlockDovetailPanel: interlockDovetailPanelModule,
    groovedShelf: groovedShelfModule,
} = panelsModule

const interlockDovetailPanel = interlockDovetailPanelModule.init({ jscad, swcadJs })
const groovedShelf = groovedShelfModule.init({ jscad, swcadJs })


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
    console.log('[BASIC BOX W/ HANGER] input parameters', params)
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

    // ----------------------------------------
    // Setting up face/side panels

    const interDovetailPanelOpts = {
        panelThickness,
        postThickness,
        dovetailLength,
        bodyType: panelType,
        fitGap,
    }

    const hangerHoleDiam = math.inchesToMm(9 / 64)
    const hangerEdgeThickness = math.inchesToMm(3 / 16)
    const hangerWidth = hangerEdgeThickness * 2 + hangerHoleDiam
    const hangerBlank = cuboid({
        size: [
            hangerWidth,
            hangerWidth,
            panelThickness
        ]
    })
    const hangerHoleCutaway = cylinder({
        radius: (hangerHoleDiam + fitGap) / 2,
        height: panelThickness * 2
    })
    const hanger = subtract(
        hangerBlank,
        hangerHoleCutaway
    )

    const widthThird = facePanelWidth / 3
    const hangerPt1 = [widthThird / -2, 0, 0]
    const hangerPt2 = [widthThird / 2, 0, 0]

    let rearPanel = interlockDovetailPanel({
        ...interDovetailPanelOpts,
        size: [facePanelWidth, height],
        positionType: 'face',
    })[0]
    rearPanel = union(
        align({ modes: ['center', 'max', 'min'] }, rearPanel),
        align({
            modes: ['center', 'min', 'min'],
            relativeTo: hangerPt1,
        }, hanger),
        align({
            modes: ['center', 'min', 'min'],
            relativeTo: hangerPt2,
        }, hanger),
    )

    const frontPanel = interlockDovetailPanel({
        ...interDovetailPanelOpts,
        size: [facePanelWidth, height],
        positionType: 'face',
    })[0]

    const sidePanel = interlockDovetailPanel({
        ...interDovetailPanelOpts,
        size: [sidePanelWidth, height],
        positionType: 'side',
    })[0]

    // ----------------------------------------
    // Setting up base

    const groovedShelfOpts = {
        supportSize: [length, width],
        thickness: panelThickness,
        postThickness,
        panelType,
        type: 'flush',
        fitGap,
    }

    const basePanel = groovedShelf(groovedShelfOpts)[0]

    return [
        rearPanel,
        frontPanel,
        sidePanel,
        basePanel,
    ]
}


module.exports = {
    main,
    getParameterDefinitions,
}
