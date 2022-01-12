import { ICommand, TreeGraphData } from "./../types";
import Graph from "../graph";
import _ from "lodash";
import { ItemState } from "../constants";

export interface UpdateCommandParams {
  id: string;
  originalModel: Partial<TreeGraphData>;
  updateModel: Partial<TreeGraphData>;
  forceLayout: Boolean;
}

class UpdateCommand implements ICommand<UpdateCommandParams> {
  private graph: Graph;

  name = "update";

  shortcuts = []

  params = {
    id: "",
    originalModel: {},
    updateModel: {},
    forceLayout: false,
  };

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canExecute(): boolean {
    const nodes = this.graph.findAllByState('node', ItemState.Editing);
    return nodes.length === 1;
  }

  canUndo(): boolean {
    return true;
  }

  execute(): void {
    const { graph } = this;
    const { id, updateModel } = this.params;
    graph.updateItem(id, updateModel);
    graph.layout();
  }

  undo(): void {
    const { graph } = this;
    const { id, originalModel } = this.params;
    graph.updateItem(id, originalModel);
    graph.layout(false);
  }

  init(): void {
    const { graph } = this;
    const { updateModel, id } = this.params;
    const updatePaths = Object.keys(updateModel);
    const originalModel = _.pick(graph.findById(id).getModel(), updatePaths);
    this.params.originalModel = originalModel;
  }
}

export default UpdateCommand;
