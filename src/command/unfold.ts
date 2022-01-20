import { TransactionType, TreeGraphData } from "../types";
import { createTransaction, CTRL_KEY, getNodeInfo } from "../utils";
import BaseCommand from "./base";

class UnFoldCommand extends BaseCommand {
  name = "unfold";
  shortcuts = [[CTRL_KEY, "\\"]];

  canExecute(): boolean {
    const { target } = this;
    if (!target) return false;

    const model = this.target.getModel() as TreeGraphData;
    if (!model.children || !model.children.length || !model.collapsed) {
      return false;
    }

    return true;
  }

  init() {
    const nodeInfo = getNodeInfo(this.target);
    const { model } = nodeInfo;
    this.transactions = [
      [
        createTransaction(TransactionType.UPDATE, {
          model: { ...model, collapsed: false }
        })
      ],
      [
        createTransaction(TransactionType.UPDATE, {
          model: { ...model, collapsed: true }
        })
      ]
    ];
  }
}

export default UnFoldCommand;
