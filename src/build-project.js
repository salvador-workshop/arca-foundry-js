import { exec } from "child_process";
import fs from 'node:fs';
import { join, relative } from 'path';

import {
    isDirectory,
    clearInternalDir,
    createDir,
} from './utils/file-system.js'

import {
    utils,
} from './utils/index.js'

const {
    inputDir,
    outputDir,
    internalDir,
    internalWorkspaceDir,
} = utils.directories

const {
    mouldSubjectName,
    projectConfigName,
} = utils.filenames

const pEnv = process.env
const inputProject = pEnv.npm_config_project ? pEnv.npm_config_project : ""

let detectedProject = false
let errMsg = ''

console.log('----------------------------------------------------------------\n')
console.log('> Preparing to build project in `src/input/`...')

let projId = null
if (!inputProject) {
    errMsg = '> No project specified.'
    console.error(errMsg)
    process.exit()
} else {
    projId = inputProject
}

const directoryListLong = fs.readdirSync(inputDir)
    .map(fileOrDirName => {
        return join(inputDir, fileOrDirName);
    })
    .filter(isDirectory);

const directoryList = directoryListLong.map(longDir => {
    const displayDir = relative(inputDir, longDir)
    return displayDir
})

let projInputDir = null
if (directoryList.includes(projId)) {
    detectedProject = true
    projInputDir = join(inputDir, projId)
} else {
    console.log(`> Project "${projId}" not found.`)
    process.exit()
}

console.log(`> Found project "${projId}". Setting up build...`)

if (detectedProject) {
    // read project data
    const cfgPath = join(projInputDir, projectConfigName)
    const rawCfgData = fs.readFileSync(cfgPath);
    const cfgData = JSON.parse(rawCfgData)

    let projectType = 'basicBox'
    if (cfgData && cfgData.type) {
        projectType = cfgData.type
    }

    // set up output directory
    const projOutputDir = join(outputDir, projId)
    createDir(projOutputDir)

    // set up internal directory
    createDir(internalDir)

    // set up internal workspace directory
    const projInternalDir = internalWorkspaceDir
    clearInternalDir()
    createDir(projInternalDir)

    // copy data into internal dir
    try {
        const cfgDestPath = join(projInternalDir, projectConfigName)
        fs.copyFileSync(cfgPath, cfgDestPath)

        const baseIndexDestPath = join(projInternalDir, 'index.js')
        if (projectType == 'mouldTwoPart') {
            const modelPath = join(projInputDir, mouldSubjectName)
            const modelDestPath = join(projInternalDir, mouldSubjectName)
            fs.copyFileSync(modelPath, modelDestPath)
            fs.copyFileSync(utils.scriptPaths.mouldTwoPart, baseIndexDestPath)
        } else if (projectType == 'mouldOnePart') {
            const modelPath = join(projInputDir, mouldSubjectName)
            const modelDestPath = join(projInternalDir, mouldSubjectName)
            fs.copyFileSync(modelPath, modelDestPath)
            fs.copyFileSync(utils.scriptPaths.mouldOnePart, baseIndexDestPath)
        } else {
            // default to "basic-box"
            fs.copyFileSync(utils.scriptPaths.basicBox, baseIndexDestPath)
        }
    } catch (err) {
        console.error(err);
    }

    // run JSCAD
    // const cmdString = `npx jscad src/input/${projId}/ -o output/${projId}/${projId}.stl`
    const cmdString = `npx jscad ${internalWorkspaceDir}/ -gp -o output/${projId}/${projId}-mould.stl`
    exec(cmdString, (err, stdout, stderr) => {
        if (err) {
            console.error("Error:");
            console.error(err);
        }
        console.log(stdout);
        console.error(stderr);
    });
} else {
    errMsg = '> Project not found!'
    console.error(errMsg)
}
