import { ModelConfig, ShapeStyle } from "@antv/g6";
import _ from "lodash";
import { ItemState } from "./constants";
import { Global } from "./types";

export const PLACE_HOLDER = 'please typing...';

export type NodeConfig = ModelConfig & {
  labelStyle?: ShapeStyle;
  wrapperStyle?: ShapeStyle;
  padding?: number | number[];
};

const global: Global = {
  stroke: "#959EA6",
  lineWidth: 2,
  icon: {
    fontSize: 20,
    fontFamily: "iconfont",
    gap: 6,
  },
  registeredNodes: {},
};

export function setGlobal(options: Partial<Global>) {
  _.merge(global, options);
}

export default {
  global,
  rootNode: {
    padding: [10, 20],
    labelStyle: {
      fontSize: 16,
      maxWidth: 300,
      lineHeight: 18,
      fill: "#fff",
    },
    wrapperStyle: {
      fill: "#587EF7",
      lineWidth: 0,
    },
    stateStyles: {
      [ItemState.Selected]: {
        lineWidth: 2,
        stroke: "#888",
      },
    },
  } as NodeConfig,
  xmindNode: {
    padding: [6, 10],
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
      maxWidth: 500,
      lineHeight: 20,
      textColor: "#333",
    },
  } as NodeConfig,
  placeholderNode: {
    labelStyle: {
      fontSize: 14,
      lineHeight: 20,
      fill: "#fff",
    },
    wrapperStyle: {
      fill: "#587EF7",
      lineWidth: 0,
    },
    padding: [10, 20],
  } as NodeConfig,
  nodeDescription: {
    padding: [6, 10],
    labelStyle: {
      fill: "#666",
      fontSize: 12,
      lineHeight: 16,
    },
    wrapperStyle: {},
  },
};
