import { EditorEvent, ItemState } from "./constants";
import { GraphData, IEdge, INode, TreeGraph, TreeGraphData } from "@antv/g6";
import { Item, TreeGraphData as ITreeGraphData } from "./types";
import _ from "lodash";
import { getParentId } from "./utils";

class Graph extends TreeGraph {
  $isEditing = false;

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
    return function(...args: Args): Result {
      const result = fn.apply(context, args);
      context.getGroup().setMatrix(matrix);
      return result;
    };
  }

  getLastSibling(id: string) {
    return this.findAll("node", item => item.getModel().nextId === id)[0];
  }

  private ensureNodeExpanded(id) {
    const item = this.findById(id);
    if (!item) return;
    const model = item.getModel();
    if (model.collapsed) {
      item.update({
        collapsed: false
      });
      this.layout();
    }
  }

  placeNode(
    model: ITreeGraphData,
    { nextId, parentId }: { nextId?: string | null; parentId?: string | null }
  ) {
    if (nextId) {
      this.insertBefore(model, nextId);
    } else if (parentId) {
      this.addChild(model, parentId);
    }
  }

  insertBefore(model: TreeGraphData, nextId: string | Item) {
    const nextItem: Item =
      typeof nextId === "string" ? this.findById(nextId) : nextId;
    const parentId = getParentId(nextItem);
    if (!parentId) return;

    this.ensureNodeExpanded(parentId);

    const parentItem = this.findById(parentId);
    const children = _.cloneDeep(parentItem.getModel().children) as
      | TreeGraphData[]
      | undefined;
    if (!children) return;

    const idx = children.findIndex(item => item.id === nextItem.getID());

    children.splice(idx, 0, model);
    this.updateChildren([...children], parentId);
  }

  changeData(data: GraphData | TreeGraphData) {
    return this.keepMatrix(super.changeData)(data);
  }

  addChild(data: TreeGraphData, parent: string | Item): void {
    const parentId = typeof parent === "string" ? parent : parent.getID();

    if (!parentId) return;
    this.ensureNodeExpanded(parentId);
    this.keepMatrix(super.addChild)(data, parent);
  }

  removeChild(id: string): void {
    this.keepMatrix(super.removeChild)(id);
  }

  getCurrentNode(): INode | null {
    const nodes = this.getSelectedNodes();
    if (nodes.length !== 1) return null;
    return nodes[0];
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

      [...selectedNodes, ...selectedEdges].forEach(node => {
        this.setItemState(node, ItemState.Selected, false);
      });

      items.forEach(item => {
        this.setItemState(item, ItemState.Selected, true);
      });
    });
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
  }

  isInsideGraph(id: string) {
    const item = this.findById(id);
    if (!item) return false;
    const bBox = this.findById(id).getBBox();
    const point = this.getCanvasByPoint(bBox.x, bBox.y);
    const width = this.getWidth(),
      height = this.getHeight();

    return !(
      point.x + bBox.width > width ||
      point.y + bBox.height > height ||
      point.x < 0 ||
      point.y < 0
    );
  }

  get isEditing() {
    return (
      this.$isEditing || !!this.findAllByState("node", ItemState.Editing).length
    );
  }

  selectNode(id: string) {
    const node = this.findById(id);
    if (!node) return;
    this.setSelectedItems([node]);
  }

  setEditState(state: boolean) {
    this.$isEditing = state;
  }

  hasState(state: ItemState): boolean {
    return !!this.findAllByState("node", state).length;
  }
}

export default Graph;
