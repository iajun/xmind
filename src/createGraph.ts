import { FOLD_BUTTON_GROUP } from "./shape/createLineNode";
import {
  GraphOptions as IGraphOptions,
  IG6GraphEvent,
  TreeGraphData,
} from "@antv/g6";
import EditableLabel, { EditableLabelConfig } from "./plugin/editableLabel";
import { Global } from "./types";
import config, { setGlobal } from "./config";
import { createCommandManager, CommandOption, CommandManager } from "./command";
import "./behavior";
import "./shape";
import _ from "lodash";
import Graph from "./graph";
import { getSizeByConfig } from "./shape/util";
import { onResize } from "./utils";

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
  global?: Partial<Global>;
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
      getWidth: (node) => {
        const nodeConfig = config.global.registeredNodes[node.type];
        if (!nodeConfig) return 0;
        const { mapCfg, options } = nodeConfig;
        const size = getSizeByConfig(
          options,
          typeof mapCfg === "function" ? mapCfg(node) : node
        );
        return size.width;
      },
      getHeight: (node) => {
        const nodeConfig = config.global.registeredNodes[node.type];
        if (!nodeConfig) return 0;
        const { mapCfg, options } = nodeConfig;
        const size = getSizeByConfig(
          options,
          typeof mapCfg === "function" ? mapCfg(node) : node
        );
        return size.height;
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
    global,
    data,
    commands,
    autoFit,
    editorLabelOptions = {},
    ...rest
  } = options;
  if (global) setGlobal(global);
  const finalOptions = _.merge(
    {},
    userGlobalOptions,
    getDefaultOptions(),
    rest
  );

  finalOptions.plugins.push(new EditableLabel(editorLabelOptions));

  const graph = new Graph(finalOptions);
  commandManager = createCommandManager(graph, commands);
  graph.set("command", commandManager);

  if (autoFit) {
    onResize(graph, () => {
      const el = graph.get("container");
      graph.changeSize(el.clientWidth, el.clientHeight);
    });
  }

  graph.changeData(data);
  return graph;
}
