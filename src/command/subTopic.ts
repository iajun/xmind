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
    sourceId: "",
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
    graph.removeChild(newId);
    graph.setSelectedItems([sourceId]);
  }

  canExecute(): boolean {
    const { graph } = this;

    const selectedNodes = graph.getSelectedNodes();
    return selectedNodes.length === 1;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    this.params.sourceId = selectedNodes[0].getID();
    const id = v4();
    this.params.newId = id;
  }

  execute() {
    const { graph, params } = this;
    const { sourceId, newId } = params;
    const item = graph.findById(sourceId)!;
    graph.addChild(
      { id: newId, label: "subTopic", type: "xmindNode", children: [] },
      item
    );
    graph.setSelectedItems([newId]);
  }
}

export default TopicCommand;
