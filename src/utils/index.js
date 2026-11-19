import { exec } from "child_process";
import {
    readFileSync,
    lstatSync,
    readdirSync,
    existsSync,
    mkdirSync,
    rmSync,
} from 'node:fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const utilsDir = __dirname
const rootDir = join(__dirname, '../..')

const configPath = join(rootDir, 'arca.config.json')
const inputDir = join(rootDir, 'input')
const outputDir = join(rootDir, 'output')

const srcDir = join(rootDir, 'src')
const assemblyScriptDir = join(srcDir, 'assembly-scripts')

const internalDir = join(rootDir, 'internal')
const internalWorkspaceDir = join(internalDir, 'workspace')

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
    utilsDir,
    rootDir,
    configPath,
    inputDir,
    outputDir,
    srcDir,
    assemblyScriptDir,
    internalDir,
    internalWorkspaceDir,
    unpackDate,
    dateTagDay,
    dateTagTime,
    formatParamsToCmdString,
}

export const arcaConfig = JSON.parse(arcaConfigJsonContent);

console.log(arcaConfigJsonContent);
console.log(arcaConfig);
console.log(typeof arcaConfig);

/**
 * Checks if a given path is a directory or not
 * @param {string} path 
 * @returns 
 */
export const isDirectory = path => {
    return lstatSync(path).isDirectory();
};

/**
 * Removes all files in a given directory
 * @param {string} directory 
 */
export const removeAllFilesSync = directory => {
    if (!existsSync(directory)) {
        // just quit if the directory doesn't exist
        return 0
    }

    try {
        const files = readdirSync(directory);

        for (const file of files) {
            const filePath = join(directory, file);
            // const stats = fs.statSync(filePath);
            // console.log(stats.mode)
            // fs.chmod(filePath, 0o200, (err) => {
            //     if (err) throw err;
            //     console.log(`The permissions for file "${filePath}" have been changed.`);
            // });
            // fs.chmodSync(filePath, 0o766)
            // fs.unlinkSync(filePath);
            rmSync(filePath, { recursive: true, force: true });
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Removes all files in "internal" directory
 */
export const clearInternalDir = () => {
    removeAllFilesSync(internalDir)
}

/**
 * Creates a directory if it doesn't exist
 * @param {string} directory 
 */
export const createDir = directory => {
    try {
        if (!existsSync(directory)) {
            mkdirSync(directory);
        }
    } catch (err) {
        console.error(err);
    }
}
