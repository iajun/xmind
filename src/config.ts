import _ from "lodash";
import { ItemState } from "./constants";
import { NodeConfig } from "./shape/types";
import { ModelConfig } from "./types";

export const PLACE_HOLDER = 'please typing...';

export type MindmapConfig = {
  textPlaceholder?: (config: ModelConfig) => string;
  icon: {
    fontSize: number;
    fontFamily: string;
    gap: number;
  },
  edge: {
    stroke: string;
    lineWidth: number;
  },
  node: Record<string, NodeConfig>
}

const config: MindmapConfig = {
  icon: {
    fontSize: 20,
    fontFamily: "iconfont",
    gap: 6,
  },
  edge: {
    lineWidth: 1,
    stroke: "#959EA6",
  },
  node: {
    rootNode: {
      padding: [10, 20],
      labelStyle: {
        fontSize: 16,
        fontFamily: "PingFang SC",
        maxWidth: 300,
        minWidth: 50,
        lineHeight: 24,
        fill: "#fff",
      },
      shapeType: 'rect',
      wrapperStyle: {
        fill: "#587EF7",
        lineWidth: 0,
      },
      stateStyles: {
        [ItemState.Selected]: {
          lineWidth: 2,
          fill: "#587EF7",
          stroke: "#888",
        },
      },
    },
    xmindNode: {
      padding: [6, 10],
      shapeType: 'line',
      wrapperStyle: {
        fill: "#fff",
        lineWidth: 0,
      },
      stateStyles: {
        [ItemState.Selected]: {
          stroke: "#096DD9",
          lineWidth: 1,
          fill: "#E2F0FE",
        },
      },
      labelStyle: {
        fontSize: 14,
        fontFamily: "PingFang SC",
        minWidth: 50,
        maxWidth: 500,
        lineHeight: 22,
        lineWidht: 100,
        fill: '#333'
      },
    },
    dragPlaceholderNode: {
      shapeType: 'rect',
      labelStyle: {
        fontSize: 14,
        fontFamily: "PingFang SC",
        minWidth: 50,
        maxWidth: 500,
        lineHeight: 20,
        fill: "#fff",
      },
      wrapperStyle: {
        fill: "#587EF7",
        lineWidth: 0,
      },
      padding: [10, 20],
    }
  },
};

export default config;

export const getNodeConfig = (type: string) => config.node[type]
