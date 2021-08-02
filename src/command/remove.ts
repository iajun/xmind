import { ICommand, ModelNode } from "../types";
import Graph from "../graph";
import { TreeGraphData, Util } from "@antv/g6";
import {v4} from 'uuid'
import _ from "lodash";

export interface RemoveCommandParams {
    id: string,
}

class RemoveCommand implements ICommand<RemoveCommandParams> {
  private graph: Graph;
  name = "paste";

  params = {
    id: "",
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
    this.execute();
  }

  canExecute(): boolean {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    if (selectedNodes.length !== 1) {
      return false;
    } 
    const id =  graph.get('clipboard')?.id
    return !!id
  }

  init() {
    const { graph } = this;
    const sourceId =  graph.get('clipboard')?.id
    const selectedNode = graph.getSelectedNodes()[0];
    this.params = {
      sourceId,
      targetId: selectedNode.getID()
    };
  }

  execute() {
    const { graph, params } = this;
    const {sourceId, targetId} = params
    const model = _.cloneDeep(graph.findDataById(sourceId));
    if (!model) return;
    Util.traverseTree(model, (item: ModelNode) => {
      item.id = v4()
    })
    graph.addChild(model, targetId)
  }
}

export default RemoveCommand;
