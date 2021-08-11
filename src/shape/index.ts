import createRectNode from './createRectNode'
import createLineNode from './createLineNode'
import G6  from "@antv/g6";
import config from '../config';

G6.registerNode("xmindNode", createLineNode(config.xmindNode));
G6.registerNode("rootNode", createRectNode(config.rootNode));
G6.registerNode("dragPlaceholderNode", createRectNode(config.rootNode));

export {
  createRectNode,
  createLineNode
}