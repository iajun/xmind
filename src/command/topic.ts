import { v4 } from "uuid";
import { NodeType, TransactionType } from "./../types";
import { createTransaction, getParentId } from "../utils";
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
          pointer: {
            parentId: getParentId(this.target),
            prevId: this.target.getID()
          }
        })
      ],
      [createTransaction(TransactionType.REMOVE, { model })]
    ];
  }

  undo() {
    this.select();
    return super.undo();
  }
}

export default TopicCommand;
