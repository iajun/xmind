import { ICommand, TreeGraphData } from "../types";
import Graph from "../graph";
import { Util } from "@antv/g6";
import { v4 } from "uuid";
import _ from "lodash";

export interface PasteCommandParams {
  parentId: string;
  newModel: TreeGraphData;
}

class PasteCommand implements ICommand<PasteCommandParams> {
  private graph: Graph;
  name = "paste";

  params = {
    parentId: "",
    newModel: {} as TreeGraphData,
  };

  shortcuts = [
    ["metaKey", "v"],
    ["ctrlKey", "v"],
  ];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return true;
  }

  undo(): void {
    const { graph, params } = this;
    const { newModel, parentId } = params;
    graph.removeChild(newModel.id);
    graph.setSelectedItems([parentId])
  }

  canExecute(): boolean {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    if (selectedNodes.length !== 1) {
      return false;
    }
    const model = graph.get("clipboard")?.model;
    return !!model && model.id;
  }

  init() {
    const { graph } = this;
    const newModel = _.cloneDeep(graph.get("clipboard")?.model);
    Util.traverseTree(newModel, (item: TreeGraphData) => {
      item.id = v4();
    });
    Util.traverseTree(newModel, (item) => {
      if (item.children && item.children.length) {
        item.children.forEach((child, i) => {
          child.nextId = item.children[i + 1] ? item.children[i + 1].id : null;
          child.parentId = item.id;
        });
      }
    });
    this.params.newModel = newModel;
  }

  execute() {
    const { graph, params } = this;
    const { newModel } = params;
    const selectedNode = graph.getSelectedNodes()[0];
    const parentId = this.params.parentId = selectedNode.getID();
    newModel.parentId = parentId;
    graph.addChild(newModel, parentId);
    graph.setSelectedItems([newModel.id]);
  }
}

export default PasteCommand;
