import { createGraph } from "./createGraph";
import config from "./config";

export { createGraph, setGlobalOptions } from "./createGraph";

export * from "./shape";

export {default as DomAlign } from './plugin/domAlign'

export default createGraph

import './test'

export const Global = config;
