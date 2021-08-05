import { ICommand, TreeGraphData } from "../types";
import Graph from "../graph";
import { Util } from "@antv/g6";
import {v4} from 'uuid'
import _ from "lodash";

export interface PasteCommandParams {
    targetId: string,
    newRootId: string
}

class PasteCommand implements ICommand<PasteCommandParams> {
  private graph: Graph;
  name = "paste";

  params = {
    targetId: "",
    newRootId: ''
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
    const { newRootId} = params
    graph.removeChild(newRootId)
  }

  canExecute(): boolean {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    if (selectedNodes.length !== 1) {
      return false;
    } 
    const model =  graph.get('clipboard')?.model
    return !!model
  }

  init() {
    const { graph } = this;
    const selectedNode = graph.getSelectedNodes()[0];
    this.params = {
      ...this.params,
      targetId: selectedNode.getID()
    };
  }

  execute() {
    const { graph, params } = this;
    const { targetId} = params
    const model =  _.cloneDeep(graph.get('clipboard')?.model)
    if (!model || !model.id) return;
    Util.traverseTree(model, (item: TreeGraphData) => {
      item.id = v4()
    })
    this.params.newRootId = model.id;
    graph.keepMatrix(graph.addChild)(model, targetId)
    graph.setSelectedItems([graph.findById(model.id)])
  }
}

export default PasteCommand;
