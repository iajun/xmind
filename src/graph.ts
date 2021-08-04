import { GraphState, ItemState } from "./constants";
import { GraphData, IEdge, INode, TreeGraph, TreeGraphData, Util } from "@antv/g6";
import { Item } from "./types";
import _ from "lodash";

class Graph extends TreeGraph {
  static Event = {
    /** 调用命令之前触发 */
    onBeforeExecuteCommand : "onBeforeExecuteCommand",
    /** 调用命令之后触发 */
    onAfterExecuteCommand : "onAfterExecuteCommand",
    /** 改变画面状态触发 */
    onGraphStateChange : "onGraphStateChange",
    /** 改变标签状态触发 */
    onLabelStateChange : "onLabelStateChange",
  };

  isRootNode(item: string) {
    const rootNode = this.get('data');
    if (!rootNode) return false
    return rootNode.id === item
  }

  keepMatrix<Args extends any[], Result>(fn: (...args: Args) => Result) {
    const matrix = this.getGroup().getMatrix()
    const context = this;
    return function(...args: Args): Result {
      const result = fn.apply(context, args)
      context.getGroup().setMatrix(matrix)
      return result;
    }
  }

  /** 获取选中节点 */
  getSelectedNodes(): INode[] {
    return this.findAllByState("node", ItemState.Selected);
  }

  /** 获取选中边线 */
  getSelectedEdges(): IEdge[] {
    return this.findAllByState("edge", ItemState.Selected);
  }

  /** 批量状态更新 */
  executeBatch(execute: Function) {
    const autoPaint = this.get("autoPaint");

    this.setAutoPaint(false);

    execute();

    this.paint();
    this.setAutoPaint(autoPaint);
  }

  private emitStateChange() {
    this.emit(Graph.Event.onGraphStateChange, {
      graphState: this.getGraphState(),
    });
  }

  /** 获取图表选中类型状态 */
  private getGraphState(): GraphState {
    let graphState: GraphState = GraphState.MultiSelected;

    const selectedNodes = this.getSelectedNodes();
    const selectedEdges = this.getSelectedEdges();

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

  /** 设置节点和边的选中 */
  setSelectedItems(items: Item[] | string[]) {
    this.executeBatch(() => {
      const selectedNodes = this.getSelectedNodes();
      const selectedEdges = this.getSelectedEdges();

      [...selectedNodes, ...selectedEdges].forEach((node) => {
        this.setItemState(node, ItemState.Selected, false);
      });

      items.forEach((item) => {
        this.setItemState(item, ItemState.Selected, true);
      });
    });
    this.emitStateChange()

  }

  clearSelectedState(shouldUpdate: (item: Item) => boolean = () => true) {
    const selectedNodes = this.getSelectedNodes();
    const selectedEdges = this.getSelectedEdges();
  
    this.executeBatch(() => {
      [...selectedNodes, ...selectedEdges].forEach(item => {
        if (shouldUpdate(item)) {
          this.setItemState(item, ItemState.Selected, false);
        }
      });
    });

    this.emitStateChange()
  }

  recursiveExec(updateFunc: (item: Item) => void, startId?: string) {
    const ids: string[] =  [];
    startId && ids.push(startId)
    Util.traverseTree(this.get('data') ,item => {
      if (startId) {
        if (ids.includes(item.parentId)) {
          ids.push(item.id)
        }
      } else {
        ids.push(item.id)
      }
    })
    
    this.executeBatch(() => {
      ids.forEach(id => {
        const item = this.findById(id);
        updateFunc(item)
      })
    })
  }
}

export default Graph;
