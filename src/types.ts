import {
  ComboConfig,
  EdgeConfig,
  IEdge,
  INode,
  TreeGraphData as ITreeGraphData,
  ModelConfig as IModelConfig
} from "@antv/g6";

export type NodeModel = ModelConfig | EdgeConfig | ComboConfig | TreeGraphData;

export type Node = {
  id: string;
  label: string;
  parentId: string | null;
  [key: string]: any;
};

export type TreeGraphData = ITreeGraphData & {
  type: NodeType;
  children?: TreeGraphData[];
};

export type NodeType = "rootNode" | "xmindNode";

export interface ICommand<P = any> {
  /** 命令名称 */
  name: string;
  /** 是否可以执行 */
  canExecute(): boolean;
  /** 是否应该执行，外界注入 */
  shouldExecute?: () => boolean;
  /** 是否可以撤销 */
  canUndo(): boolean;
  /** 执行命令 */
  execute(): Transaction[];
  /** 撤销命令 */
  undo(): Transaction[];
  /** 初始化参数 */
  init(params: P): void;
  /** 命令快捷键 */
  shortcuts: string[] | string[][];
  transactions: [Transaction[], Transaction[]];
}

export type ItemType = "node" | "edge";

export type Item = INode | IEdge;

export enum TransactionType {
  ADD = "add",
  UPDATE = "update",
  REMOVE = "remove",
}

export type Transaction = {
  command: TransactionType;
  payload: {
    model: TreeGraphData;
    pointer?: {
      parentId?: string | null;
      prevId?: string | null;
    };
  };
};

export type TransactionPayload = Transaction["payload"];

export type Pointer = {
  parentId: string | null;
  prevId: string | null;
};

export type ModelConfig = IModelConfig & {
  leftIcons?: string[];
  rightIcons?: string[];
}
