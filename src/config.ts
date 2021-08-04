import { LabelStyle } from "@antv/g6";

export type NodeConfig = {
  fontSize: number;
  lineHeight: number;
  padding: [number, number],
  textAlign: LabelStyle['textAlign'],
  maxLabelWidth: number
  minWidth: number
}

export default {
  rootNode: {
    fontSize: 16,
    padding: [10, 20],
    textAlign: "center",
    minWidth: 40,
    maxLabelWidth: 300,
    lineHeight: 18,
  } as NodeConfig,
  subNode: {
    fontSize: 14,
    padding: [6, 10],
    textAlign: "left",
    maxLabelWidth: 500,
    minWidth: 40,
    lineHeight: 20,
  } as NodeConfig,
  xmindNode: {
    fontSize: 14,
    padding: [6, 10],
    textAlign: "left",
    maxLabelWidth: 500,
    minWidth: 40,
    lineHeight: 16,
  } as NodeConfig,
  leafNode: {
    fontSize: 10,
    padding: [2, 8],
    textAlign: "left",
    lineHeight: 14,
    maxLabelWidth: 500,
  } as NodeConfig,
  global: {
    stroke: '#959EA6',
    lineWidth: 2,
  }
};