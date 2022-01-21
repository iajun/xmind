import { TransactionType, TreeGraphData } from "../types";
import _ from "lodash";
import {
  cloneTree,
  CTRL_KEY,
  Clipboard,
  createTransaction,
  getPrevId,
} from "../utils";
import BaseCommand from "./base";

class PasteCommand extends BaseCommand {
  name = "paste";

  shortcuts = [[CTRL_KEY, "v"]];

  canExecute(): boolean {
    const data: any = Clipboard.get();
    return super.canExecute() && data && data.id && data.model;
  }

  init() {
    const data: any = Clipboard.get();
    let model = data.model as TreeGraphData;
    const { graph } = this;
    if (graph.findById(model.id)) {
      model = cloneTree(model);
    }
    this.transactions = [
      [
        createTransaction(TransactionType.ADD, {
          model,
          pointer: {
            prevId: getPrevId(this.target),
            parentId: this.target.getID(),
          },
        }),
      ],
      [createTransaction(TransactionType.REMOVE, { model })],
    ];
  }
}

export default PasteCommand;
