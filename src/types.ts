import { IGraph } from "@antv/g6";

export type Node = {
  id: string;
  label: string;
  nextId: string | null;
  parentId: string | null;
  [key: string]: any;
};

export type NodeType = "rootNode" | "subNode" | "leafNode";

export interface Command<P = object, G = IGraph> {
  /** 命令名称 */
  name: string;
  /** 命令参数 */
  params: P;
  /** 是否可以执行 */
  canExecute(graph: G): boolean;
  /** 是否应该执行 */
  shouldExecute(graph: G): boolean;
  /** 是否可以撤销 */
  canUndo(graph: G): boolean;
  /** 初始命令 */
  init(graph: G): void;
  /** 执行命令 */
  execute(graph: G): void;
  /** 撤销命令 */
  undo(graph: G): void;
  /** 命令快捷键 */
  shortcuts: string[] | string[][];
}

export type Item = 'node' | 'edge'