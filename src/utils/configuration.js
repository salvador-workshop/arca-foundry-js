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

import {
    utils
} from './index.js'


//----------------------------------------
// Configuration
//----------------------------------------


export const globalConfigName = 'arca.config.json'
export const globalConfigPath = join(utils.directories.rootDir, globalConfigName)

const arcaConfigJsonContent = readFileSync(globalConfigPath);
export const arcaConfig = JSON.parse(arcaConfigJsonContent);

console.log(arcaConfigJsonContent);
console.log(arcaConfig);
console.log(typeof arcaConfig);
