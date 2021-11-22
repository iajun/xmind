import { IEdge, INode, TreeGraphData as ITreeGraphData } from "@antv/g6";
import { NodeConfig } from "./config";

export type Node = {
  id: string;
  label: string;
  nextId: string | null;
  parentId: string | null;
  [key: string]: any;
};

export type TreeGraphData = ITreeGraphData & {
  type: NodeType;
  children?: TreeGraphData[];
};

export type NodeType = "rootNode" | "xmindNode";

export interface ICommand<P = object> {
  /** 命令名称 */
  name: string;
  /** 命令参数 */
  params: P;
  /** 是否可以执行 */
  canExecute(): boolean;
  /** 是否应该执行，外界注入 */
  shouldExecute?: () => boolean;
  /** 是否可以撤销 */
  canUndo(): boolean;
  /** 执行命令 */
  execute(): void;
  /** 撤销命令 */
  undo(): void;
  /** 初始化参数 */
  init(): void;
  /** 命令快捷键 */
  shortcuts: string[] | string[][];
}

export type ItemType = "node" | "edge";

export type Item = INode | IEdge;

export type Global = {
  stroke: string;
  lineWidth: number;
  icon: {
    fontSize: number;
    fontFamily: string;
    gap: number;
  };
  registeredNodes: Record<string, NodeConfig>;
};
