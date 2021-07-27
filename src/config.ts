import { LabelStyle } from "@antv/g6";

export type NodeConfig = {
  fontSize: number;
  lineHeight: number;
  padding: [number, number],
  textAlign: LabelStyle['textAlign'],
  maxWidth: number
}

export default {
  rootNode: {
    fontSize: 16,
    padding: [10, 20],
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 18,
  } as NodeConfig,
  xmindNode: {
    fontSize: 10,
    padding: [2, 10],
    textAlign: "left",
    maxWidth: 500,
    lineHeight: 16,
  } as NodeConfig,
  subNode: {
    fontSize: 10,
    padding: [2, 10],
    textAlign: "left",
    maxWidth: 500,
    lineHeight: 16,
  } as NodeConfig,
  leafNode: {
    fontSize: 10,
    padding: [2, 8],
    textAlign: "left",
    lineHeight: 14,
    maxWidth: 500,
  } as NodeConfig,
  global: {
    stroke: '#000',
    lineWidth: 2,
  }
};