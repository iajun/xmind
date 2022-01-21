import { TransactionType, TreeGraphData } from "../types";
import { createTransaction, getNodeInfo } from "../utils";
import BaseCommand from "./base";

export interface RemoveCommandParams {
  id: string;
  parentId: string;
  nextId: string;
  model: TreeGraphData;
}

class RemoveCommand extends BaseCommand {
  name = "remove";

  shortcuts = ["Backspace"];

  canExecute(): boolean {
    return this.target && !this.graph.isRootNode(this.target.getID());
  }

  init() {
    const { model, pointer } = getNodeInfo(this.target);
    this.transactions = [
      [
        createTransaction(TransactionType.REMOVE, {
          model,
        }),
      ],
      [
        createTransaction(TransactionType.ADD, {
          model,
          pointer,
        }),
      ],
    ];
  }
}

export default RemoveCommand;
