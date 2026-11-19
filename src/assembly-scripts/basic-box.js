"use strict"

const jscad = require('@jscad/modeling')
const swcadJs = require('swcad-js').init({ jscad });

const {
    math,
} = swcadJs.calcs

const panelsModule = require('panels')

const {
    interlockDovetail: interlockDovetailModule,
    groovedBase: groovedBaseModule,
} = panelsModule

const interlockDovetail = interlockDovetailModule.init({ jscad, swcadJs })
const groovedBase = groovedBaseModule.init({ jscad, swcadJs })


// ----------------------------------------
// Model Input Parameters
// ----------------------------------------


const getParameterDefinitions = () => {
    return [
        { name: 'length', caption: '', type: 'float', initial: math.inchesToMm(5) },
        { name: 'width', caption: '', type: 'float', initial: math.inchesToMm(4) },
        { name: 'height', caption: '', type: 'float', initial: math.inchesToMm(3) },
        { name: 'panelThickness', caption: '', type: 'float', initial: 1.3333 },
        { name: 'postThickness', caption: '', type: 'float', initial: 4 },
        { name: 'dovetailLength', caption: '', type: 'float', initial: math.inchesToMm(1 / 2) },
        { name: 'panelType', caption: '', type: 'text', initial: 'minimal' },
        { name: 'fitGap', caption: '', type: 'float', initial: math.inchesToMm(1 / 128) },
    ];
}


// ----------------------------------------
// Model Prep
// ----------------------------------------


/**
 * Main function to be rendered by JSCAD
 * @returns `geom3` or `geom3[]`
 */
function main(params) {
    console.log('[BASIC BOX] input parameters', params)
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
        dovetailLength: math.inchesToMm(1 / 2),
        bodyType: panelType,
        fitGap,
    }

    const facePanel = interlockDovetail({
        ...interDovetailPanelOpts,
        size: [facePanelWidth, height],
        positionType: 'face',
    })[0]

    const sidePanel = interlockDovetail({
        ...interDovetailPanelOpts,
        size: [sidePanelWidth, height],
        positionType: 'side',
    })[0]

    // ----------------------------------------
    // Setting up base

    const groovedBaseOpts = {
        footingSize: [length, width],
        thickness: panelThickness,
        postThickness,
        panelType,
        type: 'wrap',
        fitGap,
    }

    const basePanel = groovedBase(groovedBaseOpts)[0]

    return [
        facePanel,
        sidePanel,
        basePanel,
    ]
}


module.exports = {
    main,
    getParameterDefinitions,
}
