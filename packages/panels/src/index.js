"use strict"

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
        postThickness: 5,
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
        bodyType: 'lattice',
        positionType: 'face',
    })[0]
    const interlockDovetailPanel4 = interlockDovetail({
        ...interlockDovetailOpts,
        bodyType: 'minimal',
        positionType: 'side',
    })[0]

    const models = [
        dPost1,
        dPost2,
        interlockDovetailPanel1,
        interlockDovetailPanel2,
        interlockDovetailPanel3,
        interlockDovetailPanel4,
    ]

    const outModels = models.map((oModel, idx) => {
        return translate([idx * spaceUnit, 0, 0], oModel)
    })

    return outModels
}


module.exports = {
    main,
}
