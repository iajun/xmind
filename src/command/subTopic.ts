import { v4 } from "uuid";
import { ICommand } from "./../types";
import Graph from "../graph";

export interface TopicCommandParams {
  newId: string;
  sourceId: string;
}

class TopicCommand implements ICommand<TopicCommandParams> {
  private graph: Graph;
  name = "sub-topic";

  params = {
    sourceId: '',
    newId: "",
  };

  shortcuts = ["Tab"];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return true;
  }

  undo(): void {
    const { graph, params } = this;
    const { newId, sourceId } = params;
    graph.keepMatrix(graph.removeChild)(newId);
    const item = graph.findById(sourceId);
    graph.setSelectedItems([item])
  }

  canExecute(): boolean {
    const { graph } = this;

    const selectedNodes = graph.getSelectedNodes();
    if (!selectedNodes.length) return false;
    const selectedNode = selectedNodes[0];

    return !graph.isRootNode(selectedNode.getID());
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    this.params.sourceId = selectedNodes[0].getID()
  }

  execute() {
    const { graph, params } = this;
    const { sourceId } = params;
    const item = graph.findById(sourceId)!;
    const id = v4();
    this.params.newId = id;
    graph.keepMatrix(graph.addChild)({ id, label: "subTopic", parentId: sourceId, type: 'xmindNode', children: [] }, item)
    graph.setSelectedItems([graph.findById(id)])
  }
}

export default TopicCommand;
