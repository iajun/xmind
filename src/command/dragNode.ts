import { Pointer, TransactionType, TreeGraphData } from "../types";
import _ from "lodash";
import { createTransaction } from "../utils";
import BaseCommand from "./base";

export interface DragNodeCommandParams {
  model: TreeGraphData;
  originalPosition: Pointer;
  nextPosition: Pointer;
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
      pointer: nextPosition,
    };
    this.transactions = [
      [
        createTransaction(TransactionType.REMOVE, { model }),
        createTransaction(TransactionType.ADD, addPayload),
      ],
      [
        createTransaction(TransactionType.REMOVE, { model }),
        createTransaction(TransactionType.ADD, {
          model: nextModel,
          pointer: originalPosition,
        }),
      ],
    ];
  }
}

export default DragNodeCommand;
