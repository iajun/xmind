import createRectNode from "./createRectNode";
import createLineNode from "./createLineNode";
import G6 from "@antv/g6";
import config from "../config";
import { each } from "lodash";

each(config.node, (shapeConfig, id) => {
  const { shapeType } = shapeConfig;
  G6.registerNode(id, { line: createLineNode, rect: createRectNode }[shapeType](shapeConfig))
})

export { createRectNode, createLineNode };
