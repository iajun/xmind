import { TreeGraphData, TransactionType } from "./../types";
import _ from "lodash";
import BaseCommand from "./base";
import { createTransaction } from "../utils";
import { INode } from "@antv/g6-core";

export interface UpdateCommandParams {
  updateModel: TreeGraphData;
}

class UpdateCommand extends BaseCommand {
  name = "update";

  shortcuts = [];

  canUndo(): boolean {
    return true;
  }

  canExecute(): boolean {
    return true;
  }

  init(params: UpdateCommandParams) {
    const { graph } = this;
    const { updateModel } = params;
    this.target = graph.findById(updateModel.id) as INode;

    this.transactions = [
      [
        createTransaction(TransactionType.UPDATE, {
          model: updateModel
        })
      ],
      [
        createTransaction(TransactionType.UPDATE, {
          model: {
            ...updateModel,
            ..._.pick(this.target.getModel() as TreeGraphData, Object.keys(updateModel))
          }
        })
      ]
    ];
  }
}

export default UpdateCommand;
