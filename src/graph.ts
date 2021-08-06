import { ItemState } from "./constants";
import {
  IEdge,
  INode,
  TreeGraph,
  TreeGraphData,
  Util,
} from "@antv/g6";
import { Item } from "./types";
import _ from "lodash";

class Graph extends TreeGraph {
  isRootNode(item: string) {
    const rootNode = this.get("data");
    if (!rootNode) return false;
    return rootNode.id === item;
  }

  keepMatrix<Args extends any[], Result>(fn: (...args: Args) => Result) {
    const matrix = this.getGroup().getMatrix();
    const context = this;
    return function (...args: Args): Result {
      const result = fn.apply(context, args);
      context.getGroup().setMatrix(matrix);
      return result;
    };
  }

  getLastSibling(id: string) {
    return this.findAll('node' ,item => item.getModel().nextId === id)[0]
  }

  insertBefore(model: TreeGraphData, id: string | Item) {
    const graphData: TreeGraphData = _.cloneDeep(this.get("data"));
    const item: Item = typeof id === "string" ? this.findById(id) : id;
    
    const nextSiblingModel = item.getModel();

    let isValid = false

    Util.traverseTree(graphData, (item: TreeGraphData) => {
      if (item.id === nextSiblingModel.parentId) {
        if (!item.children) return;
        const idx = item.children.findIndex(
          (item) => item.id === nextSiblingModel.id
        );
        isValid = true;

        model.nextId = nextSiblingModel.id;
        model.parentId = nextSiblingModel.parentId;
        
        item.children[idx - 1] && (item.children[idx - 1].nextId = model.id);
        item.children.splice(idx, 0, model);
      }
    });
    if (isValid) {
      this.changeData(graphData);
    }
  }

  addChild(data: TreeGraphData, parent: string | Item): void {
    const parentId = typeof parent === 'string' ? parent : parent.getID();
    const parentItem = typeof parent ===  'string' ? this.findById(parent) : parent;
    const lastChild = this.findAll('node', item => {
      const model = item.getModel()
      return model.parentId === parentId && model.nextId === null;
    })[0]
    if (lastChild) {
      lastChild.update({
        nextId: data.id
      });
    }
    // unfold
    parentItem.update({
      collapsed: false
    })
    
    data.parentId = parentId;
    data.nextId = null;
    super.addChild(data, parent)
  }

  removeChild(id: string): void {
    const model = this.findById(id).getModel();
    const lastSibling = this.findAll('node' ,item => item.getModel().nextId === id)[0]
    if (lastSibling) {
      lastSibling.update({
        nextId: model.nextId
      })
    }
    super.removeChild(id)
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

  /** 设置节点和边的选中 */
  setSelectedItems(items: (Item | string)[] | string[]) {
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
  }

  clearSelectedState(shouldUpdate: (item: Item) => boolean = () => true) {
    const selectedNodes = this.getSelectedNodes();
    const selectedEdges = this.getSelectedEdges();

    this.executeBatch(() => {
      [...selectedNodes, ...selectedEdges].forEach((item) => {
        if (shouldUpdate(item)) {
          this.setItemState(item, ItemState.Selected, false);
        }
      });
    });

  }
}

export default Graph;
