import { join } from 'path';

import {
    utils
} from './index.js'

export const mouldCfgName = 'config.json'
export const mouldSubjectName = 'model.stl'
export const scriptNameOnePartMould = 'mould-one-part.js'
export const scriptNameTwoPartMould = 'mould-two-part.js'

export const scriptPathOnePartMould = join(utils.assemblyScriptDir, scriptNameOnePartMould)
export const scriptPathTwoPartMould = join(utils.assemblyScriptDir, scriptNameTwoPartMould)
