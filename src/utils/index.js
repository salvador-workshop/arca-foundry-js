import { dirname, join } from 'path';
import { fileURLToPath } from 'url';


//----------------------------------------
// Directories
//----------------------------------------


const __dirname = dirname(fileURLToPath(import.meta.url));
const utilsDir = __dirname
const rootDir = join(__dirname, '../..')

const inputDir = join(rootDir, 'input')
const outputDir = join(rootDir, 'output')

const srcDir = join(rootDir, 'src')
const assemblyScriptDir = join(srcDir, 'assembly-scripts')

const internalDir = join(rootDir, 'internal')
const internalWorkspaceDir = join(internalDir, 'workspace')

const directories = {
    utilsDir,
    rootDir,
    inputDir,
    outputDir,
    srcDir,
    assemblyScriptDir,
    internalDir,
    internalWorkspaceDir,
}


//----------------------------------------
// Project Types
//----------------------------------------


const projectTypes = {
    basicBox: { id: 'basic-box', description: '' },
    mouldOnePart: { id: 'mould-one-part', description: '' },
    mouldTwoPart: { id: 'mould-two-part', description: '' },
    openTwoLevelShelf: { id: 'open-two-level-shelf', description: '' },
}


//----------------------------------------
// Standard Paths and Filenames
//----------------------------------------


const projectScriptNames = {}
const projectScriptPaths = {}
for (const projType in projectTypes) {
    const currentProjScriptName = `${projectTypes[projType].id}.js`
    projectScriptNames[projType] = currentProjScriptName
    projectScriptPaths[projType] = join(assemblyScriptDir, currentProjScriptName)
}

const scriptPaths = {
    basicBox: projectScriptPaths['basicBox'],
    mouldOnePart: projectScriptPaths['mouldOnePart'],
    mouldTwoPart: projectScriptPaths['mouldTwoPart'],
    openTwoLevelShelf: projectScriptPaths['openTwoLevelShelf'],
}

const filenames = {
    mouldSubjectName: 'model.stl',
    projectConfigName: 'config.json',
}


//----------------------------------------
// Utility Functions
//----------------------------------------


const unpackDate = (inputDate) => {
    const [month, day, year, hour, minutes, seconds, milliseconds] = [
        inputDate.getMonth(),
        inputDate.getDate(),
        inputDate.getFullYear(),
        inputDate.getHours(),
        inputDate.getMinutes(),
        inputDate.getSeconds(),
        inputDate.getMilliseconds(),
    ];

    return {
        month,
        day,
        year,
        hour,
        minutes,
        seconds,
        milliseconds
    }
}

const dateTagDay = (unpackedDate) => {
    const fMonth = String(unpackedDate.month).padStart(2, '0');
    const fDay = String(unpackedDate.day).padStart(2, '0');

    const dTagDay = `${unpackedDate.year}-${fMonth}${fDay}`

    return dTagDay
}

const dateTagTime = (unpackedDate) => {
    const fHours = String(unpackedDate.hour).padStart(2, '0');
    const fMins = String(unpackedDate.minutes).padStart(2, '0');
    const fSecs = String(unpackedDate.seconds).padStart(2, '0');
    const fMilli = String(unpackedDate.milliseconds).padStart(3, '0');

    const dTagTime = `${fHours}${fMins}${fSecs}${fMilli}`

    return dTagTime
}

const formatParamsToCmdString = (modelParameters) => {
    //   jscad name_plate.jscad --name "Just Me" --title "CEO"

    const paramStrs = []
    for (const param in modelParameters) {
        const paramVal = modelParameters[param]
        paramStrs.push(`--${param} "${paramVal}"`)
    }

    return paramStrs.join(' ')
}

const functions = {
    unpackDate,
    dateTagDay,
    dateTagTime,
    formatParamsToCmdString,
}


//----------------------------------------
// Various Exports
//----------------------------------------


export const utils = {
    directories,
    projectTypes,
    scriptPaths,
    filenames,
    functions,
}
