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

const inchesToMm = (numIn) => numIn * 25.4

const rectPostFootModule = require('./rectangular-post-foot/index.js')
const rectPostFoot = rectPostFootModule.init({ jscad, swcadJs })


//-----------------------------------------------
// Model / Scene Prep
//-----------------------------------------------


const rectPostFootOpts = {
    // postSize: 0,
    // sleeveHeight: 0,
    // baseExtWidth: 0,
    // thickness: 0,
    // fitGap: 0,
}

const rectPostFootModel = rectPostFoot(rectPostFootOpts)[0]

const spaceUnit = inchesToMm(3.5)


/**
 * Main function to be rendered by JSCAD
 * @returns `geom3` or `geom3[]`
 * @ignore
 */
function main() {

    return [
        translate([spaceUnit * 0, spaceUnit * 0, spaceUnit * 0], rectPostFootModel),
    ]
}


module.exports = {
    main,
}
