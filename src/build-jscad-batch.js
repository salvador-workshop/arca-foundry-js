// const { exec } = require("child_process");
// const fs = require('node:fs');

import { exec } from "child_process";
import {
    readFileSync,
    lstatSync,
    readdirSync,
    existsSync,
    mkdirSync,
} from 'node:fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../arca.config.json')
const inputDir = join(__dirname, '../input')
const outputDir = join(__dirname, '../output')

const arcaConfigJsonContent = readFileSync(configPath);
const arcaConfigJsonData = JSON.parse(arcaConfigJsonContent);
console.log(arcaConfigJsonContent);
console.log(arcaConfigJsonData);
console.log(typeof arcaConfigJsonData);

const pEnv = process.env
const inputProject = pEnv.npm_config_project ? pEnv.npm_config_project : ""
let detectedProject = false
let detectedBuildConfigs = false
let errMsg = ''

console.log('----------------------------------------------------------------\n')
console.log('> Preparing to run JSCAD with files from `src/input/`...')

let projId = null
if (!inputProject) {
    errMsg = '> No project specified!'
    console.error(errMsg)
} else {
    projId = inputProject
}

const isDirectory = fileName => {
    return lstatSync(fileName).isDirectory();
};
const directoryListLong = readdirSync(inputDir)
    .map(fileName => {
        return join(inputDir, fileName);
    })
    .filter(isDirectory);
const directoryList = directoryListLong.map(longDir => {
    const displayDir = relative(inputDir, longDir)
    return displayDir
})
console.log(directoryListLong)
console.log(directoryList)

let bProjects = []
let bArgs = []
let configHasProjects = false
let configHasBuildArgs = false

if (Object.hasOwn(arcaConfigJsonData, 'buildProjects')
    && Array.isArray(arcaConfigJsonData.buildProjects)
    && arcaConfigJsonData.buildProjects.length > 0) {
    configHasProjects = true
    bProjects = arcaConfigJsonData.buildProjects
}

if (Object.hasOwn(arcaConfigJsonData, 'buildArgs')
    && Array.isArray(arcaConfigJsonData.buildArgs)
    && arcaConfigJsonData.buildArgs.length > 0) {
    configHasBuildArgs = true
    bArgs = arcaConfigJsonData.buildArgs
}

if (configHasProjects && configHasBuildArgs) {
    detectedBuildConfigs = true
}

// if (directoryList.includes(projId)) {
if (directoryList.some(r => bProjects.includes(r))) {
    detectedProject = true
}

if (detectedProject && detectedBuildConfigs) {
    // run JSCAD
    // exec(cmdString, (err, stdout, stderr) => {
    //     if (err) {
    //         console.error();
    //         console.error("Error:");
    //         console.error(err);
    //         console.error();
    //     }
    //     console.log(stdout);
    //     console.error(stderr);
    // });

    bProjects.forEach(bProject => {
        console.log(`Building ${bProject}...`);
        bArgs.forEach(bArgOpt => {
            console.log('bArgOpt', bArgOpt);
            const projOutputDir = join(outputDir, bProject)
            // const cmdString = `npx jscad src/input/${bProject}/ -o output/${bProject}/${bProject}.stl`
            const cmdString = `npx jscad input/${bProject}/ -gp -o output/`

            // create output folder
            try {
                if (!existsSync(projOutputDir)) {
                    mkdirSync(projOutputDir);
                }
            } catch (err) {
                console.error(err);
            }
        })
    })
} else {
    errMsg = '> Project or build configuration not found!'
    console.error(errMsg)
}

console.log('\n----------------------------------------------------------------\n')
