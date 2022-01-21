import { v4 } from "uuid";
import { NodeType, TransactionType } from "./../types";
import { createTransaction } from "../utils";
import BaseCommand from "./base";

export interface TopicCommandParams {
  parentId: string | null;
  id: string | null;
  selectedId: string | null;
  nextId: string | null;
}

class SubTopicCommand extends BaseCommand {
  name = "subTopic";
  shortcuts = ["Tab"];

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
          nextId: null,
          parentId: this.target.getID()
        })
      ],
      [createTransaction(TransactionType.REMOVE, { model })]
    ];
  }
}

export default SubTopicCommand;
