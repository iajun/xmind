import { v4 } from "uuid";
import { NodeType, TransactionType } from "./../types";
import { createTransaction } from "../utils";
import BaseCommand from "./base";
import { last } from "lodash";
import { INode } from "@antv/g6";

class SubTopicCommand extends BaseCommand {
  name = "subTopic";
  shortcuts = ["Tab"];

  init() {
    const model = {
      id: v4(),
      label: "",
      type: "xmindNode" as NodeType,
      children: [],
    };
    const lastChild = last(this.target.get("children")) as INode | undefined;

    this.transactions = [
      [
        createTransaction(TransactionType.ADD, {
          model,
          pointer: {
            prevId: lastChild ? lastChild.getID() : null,
            parentId: this.target.getID(),
          },
        }),
      ],
      [createTransaction(TransactionType.REMOVE, { model })],
    ];
  }
}

export default SubTopicCommand;
