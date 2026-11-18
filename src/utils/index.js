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

import {
    draftUtils as draftUtilsModule
} from './draft-utils.js'

import {
    // inputDir,
    // outputDir,
    internalDir,
    internalWorkspaceDir,
    isDirectory,
    mouldCfgName,
    mouldSubjectName,
    baseIndexPathOnePart,
    baseIndexPathTwoPart,
    clearInternalDir
} from './mould-utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url));
const utilsDir = __dirname
const rootDir = join(__dirname, '../..')

const srcDir = join(rootDir, './arca.config.json')
const configPath = join(rootDir, './arca.config.json')
const inputDir = join(rootDir, './input')
const outputDir = join(rootDir, './output')

const arcaConfigJsonContent = readFileSync(configPath);

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

export const utils = {
    rootDir,
    srcDir,
    configPath,
    inputDir,
    outputDir,
    utilsDir,
    unpackDate,
    dateTagDay,
    dateTagTime,
    formatParamsToCmdString,
}

export const draftUtils = draftUtilsModule;

export const mouldUtils = {
    inputDir,
    outputDir,
    internalDir,
    internalWorkspaceDir,
    isDirectory,
    mouldCfgName,
    mouldSubjectName,
    baseIndexPathOnePart,
    baseIndexPathTwoPart,
    clearInternalDir,
};

export const arcaConfig = JSON.parse(arcaConfigJsonContent);

console.log(arcaConfigJsonContent);
console.log(arcaConfig);
console.log(typeof arcaConfig);