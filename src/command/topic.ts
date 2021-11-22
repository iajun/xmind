import { v4 } from "uuid";
import { ICommand, NodeType } from "./../types";
import Graph from "../graph";
import { getNextId, getParentId } from "../utils";

export interface TopicCommandParams {
  parentId: string | null;
  id: string | null;
  selectedId: string | null;
  nextId: string | null;
}

class TopicCommand implements ICommand<TopicCommandParams> {
  private graph: Graph;
  name = "topic";

  params = {
    parentId: null,
    id: null,
    selectedId: null,
    nextId: null,
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
    const { id, selectedId } = params;
    graph.removeChild(id);
    graph.setSelectedItems([selectedId]);
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
    const selectedNode = graph.getSelectedNodes()[0];
    this.params = {
      parentId: getParentId(selectedNode),
      nextId: getNextId(selectedNode),
      selectedId: selectedNode.getID(),
      id: v4(),
    };
  }

  execute() {
    const { graph, params } = this;
    const { id, nextId, parentId } = params;
    const newModel = {
      id,
      label: "topic",
      type: "xmindNode" as NodeType,
      children: [],
    };
    graph.placeNode(newModel, { nextId, parentId });
    graph.setSelectedItems([id]);
    this.graph.layout(false);
  }
}

export default TopicCommand;
