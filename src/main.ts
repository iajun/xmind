import Model from "./model";
import EditableLabel from './plugin/editableLabel'
import CommandController from './command'
import "./behavior";
import Graph from "./graph";
import "./style.css";
import list from "./data";
// import list from "./test";
import "./root-node";
import "./sub-node";
import "./xmind-node";
import config from "./config";
import {
  fittingLabelHeight,
  fittingLabelWidth,
  fittingString,
  treeToList,
} from "./utils";
import { ModelNode } from "./types";
import { IG6GraphEvent, Util } from "@antv/g6";
import _ from "lodash";
import { FOLD_BUTTON_GROUP } from "./xmind-node";
import { GraphCommonEvent, GraphNodeEvent } from "./constants";

console.log(Util);


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
      const nodeConfig = config[node.type];
      const width =  fittingLabelWidth(
        fittingString(node.label, nodeConfig.maxLabelWidth, nodeConfig.fontSize),
        nodeConfig.fontSize,
      );
      return width;
    },
    getHeight: (node: ModelNode) => {
      const nodeConfig = config[node.type];

      return fittingLabelHeight(
        fittingString(node.label, nodeConfig.maxLabelWidth, nodeConfig.fontSize),
        nodeConfig.lineHeight,
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
      "click-item",
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
  plugins: [new EditableLabel()]
});

tree.data(model.data);

tree.render();

const commandController = new CommandController(tree)
tree.set('command', commandController)

model.data?.id && tree.focusItem(model.data.id)

function shouldBeginCollapseExpand  (e: IG6GraphEvent)  {
  const {target, item} = e

  if (!item) return false;
  
  const shouldBegin = [target.cfg.name, target.cfg.parent?.cfg.name].some((name) =>
    [FOLD_BUTTON_GROUP].includes(name)
  );

  const model = item.getModel();

  if (shouldBegin) {
    commandController.execute(model.collapsed ? 'unfold' : 'fold', {
      id: item.getID()
    }) 
  }

  return false
};

tree.on(GraphNodeEvent.onNodeDragStart, e => {
  if (!e.item) return;
  const list = treeToList(tree.get('data'))
  const {width, centerY}  = e.item.getBBox()
  const {x , y } = Util.invertMatrix({x: e.x, y: centerY}, e.item.getContainer().getMatrix()) 
  tree.set('list', list.map(item => {
    return {
      id: item.id,
      label: item.label,
      ...tree.findById(item.id).getBBox()
    }
  }))
  const model = tree.findDataById(e.item.getID())
  tree.set('dragNode', {offsetRightX: width - x, y, offsetLeftX: x, model })
})

tree.on(GraphNodeEvent.onNodeDrag, e => {
  if (!e.item) return;
  let list = tree.get('list')
  const {offsetLeftX, offsetRightX, y} = tree.get('dragNode')
  // left centered point
  const point = {x: e.x - offsetLeftX, y};
  
  list = list.filter(item => item.x + item.width < point.x)
  let target = list[0];
  let dis = Number.MAX_SAFE_INTEGER;
  list.forEach(item => {
    const distance = Math.pow(Math.abs(point.x - item.x - item.width), 2) + Math.pow(Math.abs(point.y - item.y), 2)
    if (distance < dis) {
      dis = distance;
      target = item;
    }
  })
  tree.set('dragNode', {...tree.get('dragNode'), target})
  
})

tree.on(GraphNodeEvent.onNodeDragEnd, e => {
  if(!e.item) return;
  const {model, target} = tree.get('dragNode')
  if (!target || !model) return;
  console.log(target);
  
  tree.removeChild(e.item.getID())
  tree.addChild(model, target.id)
})