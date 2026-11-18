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


//------------------------------------------------------------------------------

const spaceUnit = math.inchesToMm(2)

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

    return [
        translate([0, 0, 0], dPost1),
        translate([0, spaceUnit, 0], dPost2),
    ]
}


module.exports = {
    main,
}
