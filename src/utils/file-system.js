import {
    lstatSync,
    readdirSync,
    existsSync,
    mkdirSync,
    rmSync,
} from 'node:fs';
import { join } from 'path';

import {
    utils
} from './index.js'


//----------------------------------------
// File System Operations
//----------------------------------------


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
    removeAllFilesSync(utils.directories.internalDir)
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