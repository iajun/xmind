import G6, { IEdge, IGraph, INode } from '@antv/g6'
import { ItemState, EditorEvent, GraphState } from './constants';
const { Util } = G6;

const isTextWrap = (str: string) => str === '\n';

export const fittingString = (str:string, maxWidth: number, fontSize: number) => {
  const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
  let currentWidth = 0;
  let res = '';
  let tmp = ''
  str.split('').forEach((letter) => {
    if (currentWidth > maxWidth || isTextWrap(letter)) {
      res += `${tmp}\n`
      tmp = '';
      currentWidth = 0;
    } else {
      currentWidth +=  pattern.test(letter) ? fontSize : Util.getLetterWidth(letter, fontSize);;
      tmp += letter;
    }
  })
  if (tmp) res += tmp;
  return res;
};

export const fittingLabelWidth = (label: string, fontSize: number, paddingX: number) => {
  const maxLabelWidth = Math.max(...label.split('\n').map(line => Util.getTextSize(line, fontSize)[0]))
  return  maxLabelWidth+ paddingX * 2;
}


export const fittingLabelHeight = (label: string, lineHeight: number, paddingY: number) => {
  const textCols = label.split("\n").length;
  return lineHeight * textCols + paddingY * 2;
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