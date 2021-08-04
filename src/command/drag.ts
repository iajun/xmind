import { ICommand } from "./../types";
import Graph from "../graph";
import _ from "lodash";

export interface DragCommandParams {
  id: string;
  newParentId: string;
  newNextId: string | null;
  original: {
    parentId: string;
    nextId: string;
  };
}

class DragCommand implements ICommand<DragCommandParams> {
  private graph: Graph;

  name = "drag";

  shortcuts = [];

  params = {
    id: "",
    newParentId: "",
    newNextId: "",
    original: {
      parentId: "",
      nextId: "",
    },
  };

  constructor(graph: Graph) {
    this.graph = graph;
  }

  canExecute(): boolean {
    return true;
  }

  canUndo(): boolean {
    return true;
  }

  execute(): void {
    const { graph, params } = this;
    const { id, newNextId, newParentId } = params;
    const data = graph.findDataById(id);
    if (!data) return;

    params.original = {
      nextId: data.nextId as string,
      parentId: data.parentId as string,
    }

    graph.removeChild(id);

    const topSibling = graph.findAll(
      "node",
      (item) => item.getModel().nextId === newNextId
    )[0];
    if (topSibling) {
      topSibling.update({
        nextId: data!.id,
      });
    }
    data.nextId = newNextId;
    data.parentId = newParentId;
    if (newNextId) {
      graph.insertBefore(newNextId, data);
    } else {
      graph.addChild(data, newParentId);
    }
  }

  undo(): void {
    const { params, graph } = this;
    const {
      id,
      original: { nextId, parentId },
    } = params;

    const model = graph.findDataById(id);
    if(!model) return;
    graph.removeChild(id)

    const topSibling = graph.findAll('node',
      (item) => item.getModel().parentId === parentId && item.getModel().nextId === nextId
    )[0];
  
    model.parentId = parentId;

    if (topSibling) {
      model.nextId = topSibling.getModel().nextId;
      topSibling.update({
        nextId: model.id,
      })
      graph.insertBefore(model.nextId as string, model);
    } else {
      graph.addChild(model, model.parentId as string)
    }

  }

  init(): void {}
}

export default DragCommand;
