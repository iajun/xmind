import { ModelConfig, ShapeStyle } from "@antv/g6";
import _ from "lodash";
import { ItemState } from "./constants";
import { Global } from "./types";

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
  registeredNodes: {}
};

export function setGlobal(options: Partial<Global>) {
  _.merge(global, options)
}

export default {
  global,
  rootNode: {
    labelStyle: {
      fontSize: 16,
      textAlign: "center",
      maxWidth: 300,
      minWidth: 40,
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
        stroke: '#888'
      },
    },
    padding: [10, 20],
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
      textAlign: "left",
      maxWidth: 500,
      minWidth: 40,
      lineHeight: 20,
      textColor: "#333",
    },
  } as NodeConfig,
};
