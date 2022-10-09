import { createGraph } from "./createGraph";
import config from "./config";
// import './demo'

export { createGraph, setGlobalOptions } from "./createGraph";

export * from "./shape";

export { default as DomAlign } from "./plugin/domAlign";

export default createGraph;

export const Global = config;
