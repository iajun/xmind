import { Command, Item } from '../types';
import { IEdge, IGraph, INode } from "@antv/g6";
import { getSelectedNodes, getSelectedEdges, setSelectedItems} from '../utils'
import { EditorEvent, LabelState } from '../constants';

export interface BaseCommand<P = object, G = IGraph> extends Command<P, G> {
  /** 获取选中节点 */
  getSelectedNodes(graph: G): INode[];
  /** 获取选中连线 */
  getSelectedEdges(graph: G): IEdge[];
  /** 设置选中元素 */
  setSelectedItems(graph: G, items: Item[] | string[]): void;
  /** 编辑选中节点 */
  editSelectedNode(graph: G): void;
}

export const baseCommand: BaseCommand = {
  name: '',

  params: {},

  canExecute() {
    return true;
  },

  shouldExecute() {
    return true;
  },

  canUndo() {
    return true;
  },

  init() {},

  execute() {},

  undo() {},

  shortcuts: [],

  getSelectedNodes,

  getSelectedEdges,

  setSelectedItems,

  editSelectedNode(graph) {
    graph.emit(EditorEvent.onLabelStateChange, {
      labelState: LabelState.Show,
    });
  },
};
