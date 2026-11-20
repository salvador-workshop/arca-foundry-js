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

const dovetailPostModule = require('./interlock-dovetail/dovetail-post.js')
const dovetailPost = dovetailPostModule.init({ jscad, swcadJs })

const interlockDovetailModule = require('./interlock-dovetail/index.js')
const interlockDovetail = interlockDovetailModule.init({ jscad, swcadJs })

const groovedShelfModule = require('./grooved-shelf/index.js')
const groovedShelf = groovedShelfModule.init({ jscad, swcadJs })

//------------------------------------------------------------------------------

const spaceUnit = math.inchesToMm(4.5)

/**
 * Main function to be rendered by JSCAD
 * @returns `geom3` or `geom3[]`
 */
function main() {
    const dovetailPostOpts = {
        length: math.inchesToMm(3),
        thickness: 5,
        dovetailLength: math.inchesToMm(0.5),
    }

    const dPost1 = dovetailPost({
        ...dovetailPostOpts,
        type: 'male'
    })

    const dPost2 = dovetailPost({
        ...dovetailPostOpts,
        type: 'female'
    })

    // return [
    //     translate([0, 0, 0], dPost1),
    //     translate([0, spaceUnit, 0], dPost2),
    // ]


    const interlockDovetailOpts = {
        size: [math.inchesToMm(2.5), math.inchesToMm(3.5)],
        panelThickness: 1.3333,
        postThickness: 4,
        dovetailLength: math.inchesToMm(1 / 2),
    }

    const interlockDovetailPanel1 = interlockDovetail({
        ...interlockDovetailOpts,
        bodyType: 'solid',
        positionType: 'face',
    })[0]
    const interlockDovetailPanel2 = interlockDovetail({
        ...interlockDovetailOpts,
        bodyType: 'mesh',
        positionType: 'side',
    })[0]
    const interlockDovetailPanel3 = interlockDovetail({
        ...interlockDovetailOpts,
        bodyType: 'minimal',
        positionType: 'face',
    })[0]
    const interlockDovetailPanel4 = interlockDovetail({
        ...interlockDovetailOpts,
        bodyType: 'minimal',
        positionType: 'side',
    })[0]

    const groovedBaseOpts = {
        footingSize: [math.inchesToMm(2.5), math.inchesToMm(2.5) + 4],
        thickness: 1.3333,
        postThickness: 4,
        panelType: 'minimal',
    }

    const gBase1 = groovedShelf({
        ...groovedBaseOpts,
        type: 'wrap'
    })[0]

    const gBase2 = groovedShelf({
        ...groovedBaseOpts,
        type: 'flush'
    })[0]

    const gBase3 = groovedShelf({
        ...groovedBaseOpts,
        panelType: 'lattice',
        // type: 'flush',
        isOpen: true,
    })[0]

    const gBase4 = groovedShelf({
        ...groovedBaseOpts,
        panelType: 'lattice',
        type: 'flush',
        hasCutCorners: true,
        cornerSize: [4, 6]
    })[0]

    const modelRow1 = [
        dPost1,
        dPost2,
        interlockDovetailPanel1,
        interlockDovetailPanel2,
        interlockDovetailPanel3,
        interlockDovetailPanel4,
    ]

    const modelRow2 = [
        gBase1,
        gBase2,
        gBase3,
        gBase4,
    ]

    const outModels1 = modelRow1.map((oModel, idx) => {
        return translate([idx * spaceUnit, 0, 0], oModel)
    })

    const outModels2 = modelRow2.map((oModel, idx) => {
        return translate([idx * spaceUnit, spaceUnit, 0], oModel)
    })

    return [
        // ...outModels1,
        ...outModels2,
    ]

    // return gBase2
}


module.exports = {
    main,
}
