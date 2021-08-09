import { ICommand, TreeGraphData } from "../types";
import Graph from "../graph";
import _ from "lodash";

export interface CopyCommandParams {
  id: string;
  model: TreeGraphData;
}

class CopyCommand implements ICommand<CopyCommandParams> {
  private graph: Graph;
  name = "copy";

  params = {
    id: "",
    model: {} as TreeGraphData,
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

  undo(): void {}

  canExecute(): boolean {
    const selectedNodes = this.graph.getSelectedNodes();
    return selectedNodes.length === 1;
  }

  init() {
    const { graph } = this;
    const selectedNodes = graph.getSelectedNodes();
    if (!selectedNodes.length) return;
    const id = selectedNodes[0].getID();
    const model = _.cloneDeep(graph.findDataById(id)) as TreeGraphData;
    this.params = {
      id,
      model,
    };
  }

  execute() {
    const { id, model } = this.params;

    this.graph.set("clipboard", { id, model });
  }
}

export default CopyCommand;
