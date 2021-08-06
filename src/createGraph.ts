import { FOLD_BUTTON_GROUP } from './shape/xmindNode';
import { GraphOptions as IGraphOptions, IG6GraphEvent, TreeGraphData } from "@antv/g6";
import RootNode from "./shape/rootNode";
import XMindNode from "./shape/xmindNode";
import EditableLabel from "./plugin/editableLabel";
import { Global } from './types';
import config, { setGlobal } from './config';
import { createCommandManager, CommandOption, CommandManager } from "./command";
import './behavior'
import _ from 'lodash';
import Graph from './graph';

type GraphOptions = Pick<IGraphOptions, 'container' | 'animate' | 'animateCfg' | 'fitCenter' | 'fitView' | 'fitViewPadding' | 'width' | 'height' | 'maxZoom' | 'minZoom' | 'plugins'> & {
  global?: Partial<Global>
  data?: TreeGraphData,
  commands?: CommandOption[]
}

let commandManager: CommandManager

function getDefaultOptions(): IGraphOptions {
  return  {
    container: '' ,
      enabledStack: false,
      animate: false,
      fitViewPadding: [10, 20],
      layout: {
        type: "mindmap",
        direction: "H",
        getWidth: (node: any) => {
          if (node.type === 'rootNode') return RootNode.getSize(node)[0]
          return XMindNode.getSize!(node)[0];
        },
        getHeight: (node: any) => {
          if (node.type === 'rootNode') return RootNode.getSize(node)[1]
          return XMindNode.getSize!(node)[1];
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
      plugins: [
        new EditableLabel(), 
      ]
  }
}

const userGlobalOptions: GraphOptions = {
  container: ''
}

export function setGlobalOptions(options: GraphOptions) {
  _.merge(userGlobalOptions, options) 
}

function shouldBeginCollapseExpand(e: IG6GraphEvent) {
  const { target, item } = e;

  if (!item) return false;

  const shouldBegin = [target.cfg.name, target.cfg.parent?.cfg.name].some(
    (name) => [FOLD_BUTTON_GROUP].includes(name)
  );

  const model = item.getModel();

  if (shouldBegin) {
    commandManager.execute(
      model.collapsed ? "unfold" : "fold", {
      id: item.getID(),
    });
  }

  return false;
}


export function createGraph(options: GraphOptions) {
  const {global, data, commands, ...rest} = options
  if (global) setGlobal(global)
  const finalOptions = _.merge({}, userGlobalOptions, getDefaultOptions(), rest)
  
  const graph = new Graph(finalOptions)
  commandManager = createCommandManager(graph, commands);
  graph.set("command", commandManager);
  graph.changeData(data)
  return graph;
}