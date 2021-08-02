import { ICommand } from "../types";
import Graph from "../graph";
import _ from "lodash";

export interface CopyCommandParams {
  id: string;
}

class CopyCommand implements ICommand<CopyCommandParams> {
  private graph: Graph;
  name = "copy";

  params = {
    id: "",
  };

  shortcuts = [
    ["metaKey", "c"],
    ["ctrlKey", "c"],
  ];

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canUndo(): boolean {
    return false;
  }

  undo(): void {
  }

  canExecute(): boolean {
    const selectedNodes = this.graph.getSelectedNodes();
    return selectedNodes.length === 1;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    if (!selectedNodes.length) return;
    this.params = {
      id: selectedNodes[0].getID(),
    };
  }

  execute() {
    const { graph } = this;
    const { id } = this.params
    const model = graph.findDataById(id);
   
    this.graph.set('clipboard', {id, model })
  }
}

export default CopyCommand;
