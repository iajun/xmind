import { EditorEvent, ItemState } from "./constants";
import {
  GraphData,
  IEdge,
  INode,
  TreeGraph,
  TreeGraphData,
} from "@antv/g6";
import { Item, TreeGraphData as ITreeGraphData } from "./types";
import _ from "lodash";

class Graph extends TreeGraph {
  isRootNode(item: string) {
    const rootNode = this.get("data");
    if (!rootNode) return false;
    return rootNode.id === item;
  }

  destroy() {
    this.emit(EditorEvent.onBeforeDestroy, this);
    super.destroy();
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
    return this.findAll("node", (item) => item.getModel().nextId === id)[0];
  }

  placeNode(model: ITreeGraphData) {
    if (model.nextId) {
      this.insertBefore(model, model.nextId)
    } else if (model.parentId) {
      this.addChild(model, model.parentId)
    }
  }

  insertBefore(model: TreeGraphData, id: string | Item) {
    const item: Item = typeof id === "string" ? this.findById(id) : id;
    const parentId = item.getModel().parentId as string | null;
    if (!parentId) return;

    const children = _.cloneDeep(
      this.findById(parentId).getModel().children
    ) as TreeGraphData[] | null;
    if (!children) return;

    const nextSiblingModel = item.getModel();

    const idx = children.findIndex((item) => item.id === nextSiblingModel.id);

    model.nextId = nextSiblingModel.id;
    model.parentId = nextSiblingModel.parentId;

    children[idx - 1] && (children[idx - 1].nextId = model.id);
    children.splice(idx, 0, model);

    if (children) {
      this.updateChildren(children, model.parentId as string);
    }
  }

  changeData(data: GraphData | TreeGraphData) {
    return this.keepMatrix(super.changeData)(data);
  }

  addChild(data: TreeGraphData, parent: string | Item): void {
    const parentId = typeof parent === "string" ? parent : parent.getID();
    const parentItem =
      typeof parent === "string" ? this.findById(parent) : parent;
    const lastChild = this.findAll("node", (item) => {
      const model = item.getModel();
      return model.parentId === parentId && model.nextId === null;
    })[0];
    if (lastChild) {
      lastChild.update({
        nextId: data.id,
      });
    }
    // unfold
    parentItem.update({
      collapsed: false,
    });

    data.parentId = parentId;
    data.nextId = null;
    this.keepMatrix(super.addChild)(data, parent);
  }

  removeChild(id: string): void {
    const model = this.findById(id).getModel();
    const lastSibling = this.findAll(
      "node",
      (item) => item.getModel().nextId === id
    )[0];
    if (lastSibling) {
      lastSibling.update({
        nextId: model.nextId,
      });
    }
    this.keepMatrix(super.removeChild)(id);
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
