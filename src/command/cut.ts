import { TreeGraphData, TransactionType } from "../types";
import {
  Clipboard,
  createClipboardItem,
  createTransaction,
  CTRL_KEY,
  getNodeInfo
} from "../utils";
import BaseCommand from "./base";

export interface CutCommandParams {
  id: string;
  parentId: string;
  nextId: string | null;
  model: TreeGraphData;
}

class CutCommand extends BaseCommand {
  name = "cut";

  shortcuts = [[CTRL_KEY, "x"]];

  init() {
    const { target } = this;
    this.transactions = [
      [createTransaction(TransactionType.REMOVE, getNodeInfo(target))],
      [createTransaction(TransactionType.ADD, getNodeInfo(target))]
    ];
  }

  execute() {
    Clipboard.set(createClipboardItem(this.target));
    return super.execute();
  }
}

export default CutCommand;
