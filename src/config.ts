import { LabelStyle } from "@antv/g6";
import { Global } from "./types";

export type NodeConfig = {
  fontSize: number;
  lineHeight: number;
  padding: [number, number],
  textAlign: LabelStyle['textAlign'],
  maxLabelWidth: number
  minWidth: number
}

const global: Global = {
  stroke: '#959EA6',
  lineWidth: 2,
}

export function setGlobal(options: Partial<Global>) {
  Object.assign(global, options)
}

export default {
  global,
  rootNode: {
    fontSize: 16,
    padding: [10, 20],
    textAlign: "center",
    minWidth: 40,
    maxLabelWidth: 300,
    lineHeight: 18,
  } as NodeConfig,
  xmindNode: {
    fontSize: 14,
    padding: [6, 10],
    textAlign: "left",
    maxLabelWidth: 500,
    minWidth: 40,
    lineHeight: 20,
  } as NodeConfig,
};