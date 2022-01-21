import { TransactionType, TreeGraphData } from "../types";
import _ from "lodash";
import { cloneTree, createTransaction } from "../utils";
import BaseCommand from "./base";

export type Position = {
  parentId: string | null;
  nextId: string | null;
}

export interface DragNodeCommandParams {
  model: TreeGraphData;
  originalPosition: Position,
  nextPosition: Position
}

class DragNodeCommand extends BaseCommand {
  name = "drag-node";

  shortcuts = [];

  canExecute() {
    return true;
  }

  init(params: DragNodeCommandParams) {
    let { model, originalPosition, nextPosition } = params;
    let nextModel = model;
    const addPayload = {
      model: nextModel,
      ...nextPosition
    };
    this.transactions = [
      [
        createTransaction(TransactionType.REMOVE, { model }),
        createTransaction(TransactionType.ADD, addPayload)
      ],
      [
        createTransaction(TransactionType.REMOVE, { model }),
        createTransaction(TransactionType.ADD, {
          model: nextModel,
          ...originalPosition
        })
      ]
    ];
  }
}

export default DragNodeCommand;
