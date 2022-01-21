import { v4 } from "uuid";
import { NodeType, TransactionType } from "./../types";
import { createTransaction, getNodeInfo } from "../utils";
import BaseCommand from "./base";

export interface TopicCommandParams {
  parentId: string | null;
  id: string | null;
  selectedId: string | null;
  nextId: string | null;
}

class TopicCommand extends BaseCommand {
  name = "topic";
  shortcuts = ["Enter"];

  canExecute(): boolean {
    const { graph } = this;
    return this.target && !graph.isRootNode(this.target.getID());
  }

  init() {
    const { nextId, parentId } = getNodeInfo(this.target);
    const model = {
      id: v4(),
      label: "",
      type: "xmindNode" as NodeType,
      children: []
    };
    this.transactions = [
      [
        createTransaction(TransactionType.ADD, {
          model,
          nextId,
          parentId
        })
      ],
      [createTransaction(TransactionType.REMOVE, { model })]
    ];
  }
}

export default TopicCommand;
