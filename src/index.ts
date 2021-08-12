import { createGraph } from "./createGraph";
import config from "./config";

export { createGraph, setGlobalOptions } from "./createGraph";

export * from "./shape";

export default createGraph;

export const Global = config;
