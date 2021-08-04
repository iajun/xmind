import Model from "./model";
import EditableLabel from "./plugin/editableLabel";
import CommandController from "./command";
import "./behavior";
import Graph from "./graph";
import "./style.css";
import list from "./data";
// import list from "./test";
import "./shape/root-node";
import "./shape/sub-node";
import "./shape/xmind-node";
import "./shape/delegate-node";
import config from "./config";
import { fittingLabelHeight, fittingLabelWidth } from "./utils";
import { ModelNode } from "./types";
import { IG6GraphEvent, Util } from "@antv/g6";
import _ from "lodash";
import { FOLD_BUTTON_GROUP } from "./shape/xmind-node";

const model = new Model(list);

const tree = new Graph({
  container: "xmind",
  width: 1600,
  height: 800,
  animate: false,
  fitViewPadding: [10, 20],
  layout: {
    type: "mindmap",
    direction: "H",
    getWidth: (node: ModelNode) => {
      const nodeConfig = config[node.type] || config.subNode;

      const formattedPadding = Util.formatPadding(nodeConfig.padding);
      const width =
        Math.max(
          fittingLabelWidth(node.label, nodeConfig.fontSize),
          nodeConfig.minWidth
        ) +
        formattedPadding[1] +
        formattedPadding[3];
      return width;
    },
    getHeight: (node: ModelNode) => {
      const nodeConfig = config[node.type] || config.subNode;

      const formattedPadding = Util.formatPadding(nodeConfig.padding);
      const height =
        fittingLabelHeight(node.label, nodeConfig.lineHeight) +
        formattedPadding[0] +
        formattedPadding[2];
      return height;
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
      "click-item",
      "drag-node",
      {
        type: "scroll-canvas",
        scalableRange: 0,
      },
      {
        type: "drag-node",
        enableDelegate: true,
      },
      {
        type: "collapse-expand",
        shouldBegin: shouldBeginCollapseExpand,
      },
    ],
  },
  plugins: [new EditableLabel()],
});

tree.data(model.data);

tree.render();

const commandController = new CommandController(tree);
tree.set("command", commandController);

model.data?.id && tree.focusItem(model.data.id);

function shouldBeginCollapseExpand(e: IG6GraphEvent) {
  const { target, item } = e;

  if (!item) return false;

  const shouldBegin = [target.cfg.name, target.cfg.parent?.cfg.name].some(
    (name) => [FOLD_BUTTON_GROUP].includes(name)
  );

  const model = item.getModel();

  if (shouldBegin) {
    commandController.execute(model.collapsed ? "unfold" : "fold", {
      id: item.getID(),
    });
  }

  return false;
}
