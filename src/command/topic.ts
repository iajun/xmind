import { v4 } from "uuid";
import { ICommand, TreeGraphData } from "./../types";
import Graph from "../graph";

export interface TopicCommandParams {
  originalModel: TreeGraphData,
  newId: string;
}

class TopicCommand implements ICommand<TopicCommandParams> {
  private graph: Graph;
  name = "topic";

  params = {
    originalModel: {} as TreeGraphData,
    newId: "",
  };

  shortcuts = ["Enter"];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return true;
  }

  undo(): void {
    const { graph, params } = this;
    const { newId, originalModel } = params;
    graph.keepMatrix(graph.removeChild)(newId);
    const item = graph.findById(originalModel.id);
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
    this.params.originalModel = selectedNodes[0].getModel() as TreeGraphData;
  }

  execute() {
    const { graph, params } = this;
    const { originalModel } = params;
    const id = v4();
    const newModel = { id, label: "topic", type: 'xmindNode', children: [] };
    if (originalModel.nextId) {
      graph.keepMatrix(graph.insertBefore)(newModel, originalModel.nextId)
    } else {
      graph.keepMatrix(graph.addChild)(newModel, graph.findById(originalModel.parentId));
    }
    this.params.newId = id;
    graph.setSelectedItems([graph.findById(id)])
    this.graph.layout(false);
  }
}

export default TopicCommand;
