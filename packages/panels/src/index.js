"use strict"

//-----------------------------------------------------------------------------
// This file is primarily used for testing components in the JSCAD web viewer.
// Exports for external usage are initialized in the package root's "index.js"
//-----------------------------------------------------------------------------

const jscad = require('@jscad/modeling')

const {
    cube,
    cylinder,
    sphere,
    cylinderElliptic,
    circle,
    cuboid,
    roundedCuboid,
    roundedCylinder,
    roundedRectangle,
    rectangle,
    triangle,
} = jscad.primitives

const {
    align,
    translate,
    rotate,
    mirror
} = jscad.transforms

const {
    intersect,
    subtract,
    union,
    scission
} = jscad.booleans

const {
    extrudeLinear,
    extrudeRotate,
    project
} = jscad.extrusions

const {
    measureDimensions,
    measureBoundingBox,
    measureVolume
} = jscad.measurements

const {
    hull,
    hullChain
} = jscad.hulls

const { vectorText } = jscad.text
const { toOutlines } = jscad.geometries.geom2
const { TAU } = jscad.maths.constants
const { colorize } = jscad.colors

const swcadJs = require('swcad-js').init({ jscad });

const {
    math,
    position,
} = swcadJs.calcs

const interlockDovetailPanelModule = require('./interlock-dovetail-panel/index.js')
const interlockDovetailPanel = interlockDovetailPanelModule.init({ jscad, swcadJs })

const interlockDovetailFrameModule = require('./interlock-dovetail-frame/index.js')
const interlockDovetailFrame = interlockDovetailFrameModule.init({ jscad, swcadJs })

const groovedShelfModule = require('./grooved-shelf/index.js')
const groovedShelf = groovedShelfModule.init({ jscad, swcadJs })

//------------------------------------------------------------------------------

const spaceUnit = math.inchesToMm(4.5)

/**
 * Main function to be rendered by JSCAD
 * @returns `geom3` or `geom3[]`
 */
function main() {
    const interDovetailFrameOpts = {
        size: [math.inchesToMm(2.5), math.inchesToMm(3.5)],
        panelThickness: 1.3333,
        postThickness: 4,
        dovetailLength: math.inchesToMm(1 / 2),
    }

    const interDovetailFrame1 = interlockDovetailFrame({
        ...interDovetailFrameOpts,
        beamLevels: [15, math.inchesToMm(3.5)],
        positionType: 'face',
    })[0]

    const interDovetailFrame2 = interlockDovetailFrame({
        ...interDovetailFrameOpts,
        positionType: 'side',
    })[0]

    const interDovetailFrame3 = interlockDovetailFrame({
        ...interDovetailFrameOpts,
        positionType: 'face',
    })[0]

    const interDovetailFrame4 = interlockDovetailFrame({
        ...interDovetailFrameOpts,
        positionType: 'side',
    })[0]

    const interlockDovetailPanelOpts = {
        size: [math.inchesToMm(2.5), math.inchesToMm(3.5)],
        panelThickness: 1.3333,
        postThickness: 4,
        dovetailLength: math.inchesToMm(1 / 2),
    }

    const interlockDovetailPanel1 = interlockDovetailPanel({
        ...interlockDovetailPanelOpts,
        bodyType: 'solid',
        positionType: 'face',
    })[0]
    const interlockDovetailPanel2 = interlockDovetailPanel({
        ...interlockDovetailPanelOpts,
        bodyType: 'mesh',
        positionType: 'side',
        panelLevels: [
            [20, 50]
        ]
    })[0]

    const interlockDovetailPanel3 = interlockDovetailPanel({
        ...interlockDovetailPanelOpts,
        bodyType: 'minimal',
        positionType: 'face',
        panelLevels: [
            [11, math.inchesToMm(3.5)]
        ]
    })[0]

    const interlockDovetailPanel4 = interlockDovetailPanel({
        ...interlockDovetailPanelOpts,
        bodyType: 'minimal',
        positionType: 'side',
        panelLevels: [
            [math.inchesToMm(0.5), math.inchesToMm(2)],
            [math.inchesToMm(2.25), math.inchesToMm(3.5)],
        ]
    })[0]

    const groovedShelfOpts = {
        supportSize: [math.inchesToMm(2.5), math.inchesToMm(2.5) + 4],
        thickness: 1.3333,
        postThickness: 4,
        panelType: 'minimal',
    }

    const gBase1 = groovedShelf({
        ...groovedShelfOpts,
        type: 'wrap'
    })[0]

    const gBase2 = groovedShelf({
        ...groovedShelfOpts,
        type: 'flush'
    })[0]

    const gBase3 = groovedShelf({
        ...groovedShelfOpts,
        panelType: 'lattice',
        // type: 'flush',
        isOpen: true,
    })[0]

    const gBase4 = groovedShelf({
        ...groovedShelfOpts,
        panelType: 'lattice',
        type: 'flush',
        hasCutCorners: true,
        cornerSize: [4, 6]
    })[0]

    const gBase5 = groovedShelf({
        ...groovedShelfOpts,
        panelType: 'lattice',
        type: 'wrap',
        hasCutCorners: true,
        cornerSize: [4, 6]
    })[0]

    const modelRow1 = [
        // dPost1,
        // dPost2,
        interDovetailFrame1,
        interDovetailFrame2,
        interDovetailFrame3,
        interDovetailFrame4,
    ]

    const modelRow2 = [
        interlockDovetailPanel1,
        interlockDovetailPanel2,
        interlockDovetailPanel3,
        interlockDovetailPanel4,
    ]

    const modelRow3 = [
        gBase1,
        gBase2,
        gBase3,
        gBase4,
        gBase5,
    ]

    const outModels1 = modelRow1.map((oModel, idx) => {
        return translate([idx * spaceUnit, 0, 0], oModel)
    })

    const outModels2 = modelRow2.map((oModel, idx) => {
        return translate([idx * spaceUnit, spaceUnit, 0], oModel)
    })

    const outModels3 = modelRow3.map((oModel, idx) => {
        return translate([idx * spaceUnit, spaceUnit * 2, 0], oModel)
    })

    return [
        ...outModels1,
        ...outModels2,
        ...outModels3,
    ]

    // return gBase2
}


module.exports = {
    main,
}
