import { FOLD_BUTTON_GROUP } from "./shape/createLineNode";
import {
  GraphOptions as IGraphOptions,
  IG6GraphEvent,
  TreeGraphData,
} from "@antv/g6";
import EditableLabel, { EditableLabelConfig } from "./plugin/editableLabel";
import C, { getNodeConfig } from "./config";
import { createCommandManager, CommandOption, CommandManager } from "./command";
import "./behavior";
import "./shape";
import _ from "lodash";
import Graph from "./graph";
import { getSizeByConfig } from "./shape/util";
import { onResize } from "./utils";
import { ModelConfig } from "./types";

type GraphOptions = Pick<
  IGraphOptions,
  | "container"
  | "animate"
  | "animateCfg"
  | "fitCenter"
  | "fitView"
  | "fitViewPadding"
  | "width"
  | "height"
  | "maxZoom"
  | "minZoom"
  | "plugins"
> & {
  data?: TreeGraphData;
  commands?: CommandOption[];
  editorLabelOptions?: EditableLabelConfig;
  autoFit?: boolean;
};

let commandManager: CommandManager;

function getDefaultOptions(): IGraphOptions {
  return {
    container: "",
    enabledStack: false,
    animate: false,
    fitViewPadding: [10, 20],
    layout: {
      type: "mindmap",
      direction: "H",
      getHGap: () => 40,
      getWidth: (node: ModelConfig) => {
        const nodeConfig = getNodeConfig(node.type)
        if (!nodeConfig) return 0;
        const size = getSizeByConfig(nodeConfig, node);
        return size.width;
      },
      getHeight: (node: ModelConfig) => {
        const nodeConfig = getNodeConfig(node.type)
        if (!nodeConfig) return 0;
        const size = getSizeByConfig(nodeConfig, node);
        return size.height;
      },
      getSide: () => {
        return "right";
      },
    },
    defaultEdge: {
      type: "cubic-horizontal",
      style: {
        lineWidth: C.edge.lineWidth,
        stroke: C.edge.stroke,
      },
    },
    modes: {
      default: [
        { type: "click-item" },
        { type: "drag-node" },
        {
          type: "scroll-canvas",
        },
        {
          type: "collapse-expand",
          shouldBegin: shouldBeginCollapseExpand,
        },
      ],
    },
    plugins: [],
  };
}

const userGlobalOptions: GraphOptions = {
  container: "",
};

export function setGlobalOptions(options: GraphOptions) {
  _.merge(userGlobalOptions, options);
}

function shouldBeginCollapseExpand(e: IG6GraphEvent) {
  const { target, item } = e;

  if (!item) return false;

  const shouldBegin = [target.cfg.name, target.cfg.parent?.cfg.name].some(
    (name) => [FOLD_BUTTON_GROUP].includes(name)
  );

  const model = item.getModel();

  if (shouldBegin) {
    commandManager.execute(model.collapsed ? "unfold" : "fold", {
      id: item.getID(),
    });
  }

  return false;
}

export function createGraph(options: GraphOptions) {
  const {
    data,
    commands,
    autoFit,
    editorLabelOptions = {},
    ...rest
  } = options;
  const finalOptions = _.merge(
    {},
    userGlobalOptions,
    getDefaultOptions(),
    rest
  );

  finalOptions.plugins.push(new EditableLabel(editorLabelOptions));

  const graph = new Graph(finalOptions);
  commandManager = createCommandManager(graph, commands);
  graph.set('command', commandManager)
  graph.set('_config', C)
  const resizeCallback = () => {
    const el = graph.get("container");
    graph.changeSize(el.clientWidth, el.clientHeight);
  }
  if (autoFit) {
    onResize(graph, resizeCallback);
  }
  if (!options.width && !options.height) {
    resizeCallback()
  }

  graph.changeData(data);
  return graph;
}
