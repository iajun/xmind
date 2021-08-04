import Model from "./model";
import EditableLabel from "./plugin/editableLabel";
import CommandController from "./command";
import "./behavior";
import Graph from "./graph";
import "./style.css";
import list from "./data";
import RootNode from "./shape/root-node";
import SubNode from "./shape/sub-node";
import "./shape/xmind-node";
import "./shape/delegate-node";
import config from "./config";
import { ModelNode } from "./types";
import { IG6GraphEvent, Tooltip, Util } from "@antv/g6";
import _ from "lodash";
import { FOLD_BUTTON_GROUP } from "./shape/xmind-node";
import { NodeName } from "./constants";

const model = new Model(list);

const graph = new Graph({
  container: "xmind",
  width: 1400,
  height: 600,
  animate: false,
  fitViewPadding: [10, 20],
  enabledStack: false,
  layout: {
    type: "mindmap",
    direction: "H",
    getWidth: (node: ModelNode) => {
      return SubNode.getSize(node)[0];
    },
    getHeight: (node: ModelNode) => {
      return SubNode.getSize(node)[1];
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
      {
        type: "scroll-canvas",
      },
      {
        type: "collapse-expand",
        shouldBegin: shouldBeginCollapseExpand,
      },
    ],
  },
  plugins: [new EditableLabel(), new Tooltip({
    shouldBegin: shouldTooltipBegin,
    trigger: 'click',
    getContent: ( e: IG6GraphEvent ) => {
      if (!e || !e.item) return;
      return e.item.getModel().remark || '';
    },
  })],
});

graph.data(model.data);

graph.render();

const commandController = new CommandController(graph);
graph.set("command", commandController);

function shouldTooltipBegin(e: IG6GraphEvent) {
  const target = e.target;
  if (!target) return;
  if (target && target.get('name') === NodeName.Remark)  {
    return true;
  }
  return false;
}

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
