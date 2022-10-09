import createRectNode from "./createRectNode";
import createLineNode from "./createLineNode";
import G6 from "@antv/g6";
import config from "../config";
import { each, merge } from "lodash";

each(config.node, (shapeConfig, id) => {
  registerNode(id, shapeConfig)
})

export { createRectNode, createLineNode };

export function registerNode(key: string, shapeConfig: any, extendShape?: string) {
  const finalConfig = merge({}, config.node[extendShape], shapeConfig)
  const { shapeType } = finalConfig;
  config.node[key] = finalConfig;
  G6.registerNode(key, { line: createLineNode, rect: createRectNode }[shapeType](finalConfig))
}
