import fs from 'node:fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const utilsDir = dirname(fileURLToPath(import.meta.url));

export const srcDir = join(utilsDir, '..')
export const assemblyScriptDir = join(srcDir, 'assembly-scripts')
export const rootDir = join(srcDir, '..')
export const inputDir = join(srcDir, '../input')
export const outputDir = join(srcDir, '../output')
export const internalDir = join(srcDir, '../internal')
export const internalWorkspaceDir = join(internalDir, 'workspace')

export const mouldCfgName = 'config.json'
export const mouldSubjectName = 'model.stl'
export const scriptNameOnePartMould = 'mould-one-part.js'
export const scriptNameTwoPartMould = 'mould-two-part.js'

export const scriptPathOnePartMould = join(assemblyScriptDir, scriptNameOnePartMould)
export const scriptPathTwoPartMould = join(assemblyScriptDir, scriptNameTwoPartMould)

export const isDirectory = fileName => {
    return fs.lstatSync(fileName).isDirectory();
};

export const removeAllFilesSync = directory => {
    const files = fs.readdirSync(directory);

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
        fs.rmSync(filePath, { recursive: true, force: true });
    }
}

export const clearInternalDir = () => {
    removeAllFilesSync(internalDir)
}
