import G6, { ComboConfig, EdgeConfig, IEdge, IGraph, INode, NodeConfig, TreeGraphData } from '@antv/g6'
import _ from 'lodash';
import { ItemState, EditorEvent, GraphState } from './constants';
import { ModelNode } from './types';
const { Util } = G6;

const isTextWrap = (str: string) => str === '\n';

export const fittingString = (str:string, maxWidth: number, fontSize: number) => {
  let currentWidth = 0;
  let res = '';
  let tmp = ''
  str.split('').forEach((letter) => {
    if (currentWidth > maxWidth || isTextWrap(letter)) {
      res += `${tmp}\n`
      if (!isTextWrap(letter)) {
        tmp = letter;
      } else {
        tmp = ''
      }
      currentWidth = 0;
    } else {
      currentWidth += Util.getLetterWidth(letter, fontSize);;
      tmp += letter;
    }
  })
  if (tmp) res += tmp;
  return res;
};

export const fittingLabelWidth = (label: string, fontSize: number) => {
  const maxLabelWidth = Math.max(...label.split('\n').map(line => Util.getTextSize(line, fontSize)[0]))
  return  maxLabelWidth;
}


export const fittingLabelHeight = (label: string, lineHeight: number) => {
  const textCols = label.split("\n").length;
  return lineHeight * textCols;
}

/** 获取图表状态 */
export function getGraphState(graph: IGraph): GraphState {
  let graphState: GraphState = GraphState.MultiSelected;

  const selectedNodes = getSelectedNodes(graph);
  const selectedEdges = getSelectedEdges(graph);

  if (selectedNodes.length === 1 && !selectedEdges.length) {
    graphState = GraphState.NodeSelected;
  }

  if (selectedEdges.length === 1 && !selectedNodes.length) {
    graphState = GraphState.EdgeSelected;
  }

  if (!selectedNodes.length && !selectedEdges.length) {
    graphState = GraphState.CanvasSelected;
  }

  return graphState;
}


export function executeBatch(graph: any, execute: Function) {
  const autoPaint = graph.get("autoPaint");

  graph.setAutoPaint(false);

  execute();

  graph.paint();
  graph.setAutoPaint(autoPaint);
}

export function getSelectedNodes(graph: IGraph): INode[] {
  return graph.findAllByState('node', ItemState.Selected);
}


/** 获取选中边线 */
export function getSelectedEdges(graph: IGraph): IEdge[] {
  return graph.findAllByState('edge', ItemState.Selected);
}

export function setSelectedItems(graph: IGraph, items: INode[] | string[]) {
  executeBatch(graph, () => {
    const selectedNodes = getSelectedNodes(graph);
    const selectedEdges = getSelectedEdges(graph);

    [...selectedNodes, ...selectedEdges].forEach(node => {
      graph.setItemState(node, ItemState.Selected, false);
    });

    items.forEach(item => {
      graph.setItemState(item, ItemState.Selected, true);
    });
  });

  graph.emit(EditorEvent.onGraphStateChange, {
    graphState: getGraphState(graph),
  });
}

export const getLabelByModel = (model:NodeConfig | EdgeConfig | ComboConfig | TreeGraphData): string => {
  if (typeof model.label === 'object') {
    return model.label.text || ''
  } else {
    return model.label || ''
  }
}

export const isLabelEqual = (t1: string, t2: string) => {
  const mapText = (t: string) => t.trim()
  return _.isEqual(t1.split('\n').map(mapText), t2.split('\n').map(mapText))
}

export const getPositionByPoint = (text: string, point: {x: number, y: number}, fontSize: number, lineHeight: number, ) => {
  const {x, y} = point;
  const row = Math.floor(y / lineHeight + 1)
  const str =  text.split('\n')[row - 1]
  let len = 0, col = 0;
  while (len < x) {
    len += Util.getLetterWidth(str[col++], fontSize)
  }
  if (len - x > Util.getLetterWidth(str[col])) {
    col--;
  }
  const beforeLen = text.split('\n').slice(0, row - 1).reduce((a, b) => a += b.length, 0)
  
  return beforeLen + col;
}

export const treeToList = (tree: ModelNode[]) => {
  const arr: ModelNode[] = []
  Util.traverseTree(tree, item => {
    arr.push(item)
  })
  return arr;
}