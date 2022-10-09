import { TransactionType, TreeGraphData } from "../types";
import { createTransaction, CTRL_KEY, getNodeInfo } from "../utils";
import BaseCommand from "./base";

class FoldCommand extends BaseCommand {
  name = "fold";
  shortcuts = [[CTRL_KEY, "/"]];

  canExecute(): boolean {
    const { target } = this;
    if (!target) return false;

    const model = this.target.getModel() as TreeGraphData;
    if (!model.children || !model.children.length || model.collapsed) {
      return false;
    }

    return true;
  }

  init() {
    const nodeInfo = getNodeInfo(this.target);
    const { model } = nodeInfo;
    this.transactions = [
      [createTransaction(TransactionType.UPDATE, { model: { ...model, collapsed: true } })],
      [createTransaction(TransactionType.UPDATE, { model: { ...model, collapsed: false } })],
    ]
  }
}

export default FoldCommand;
