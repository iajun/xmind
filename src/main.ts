import { ItemState } from "./constants";
import Model, { ModelNode } from "./model";
import "./style.css";
import G6 from "@antv/g6";
import list from "./data";
import "./root-node";
import "./sub-node";
import './xmind-node'
import config from "./config";
import { executeBatch, fittingLabelHeight, fittingLabelWidth, fittingString } from "./utils";

const model = new Model(list);

const tree = new G6.TreeGraph({
  container: "xmind",
  width: 1600,
  height: 800,
  fitViewPadding: [10, 20],
  layout: {
    type: "mindmap",
    direction: "H",
    getWidth: (node: ModelNode) => {
      const nodeConfig = config[node.type];
      return fittingLabelWidth(
        node.label,
        nodeConfig.fontSize,
        nodeConfig.padding[1]
      );
    },
    getHeight: (node: ModelNode) => {
      const nodeConfig = config[node.type];
      
      return fittingLabelHeight(
        fittingString(node.label, nodeConfig.maxWidth, nodeConfig.fontSize),
        nodeConfig.lineHeight,
        nodeConfig.padding[0]
      );
    },
    getSide: () => {
      return "right";
    },
  },
  defaultEdge: {
    type: "cubic-horizontal",
    style: {
      lineWidth: config.global.lineWidth,
      stroke: config.global.stroke,
    },
  },
  modes: {
    default: [
      {
        type: "scroll-canvas",
        scalableRange: 0
      },
      {
        type: "drag-node",
        enableDelegate: true,
      },
    ],
  },
});

tree.on("node:click", (evt) => {
  const { item } = evt;
  if (!item) return;
  const selectedNodes = tree.findAllByState("node", ItemState.Selected);
  const isSelected = item.hasState(ItemState.Selected);
  executeBatch(tree, () => {
    selectedNodes.forEach((item) => {
      tree.setItemState(item, ItemState.Selected, false);
    });
  });
  tree.setItemState(item, ItemState.Selected, !isSelected);
});
tree.data(model.data);

tree.render();
