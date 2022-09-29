import { INode } from "@antv/g6-core";
import Graph from "../graph";
import { ICommand, Transaction } from "../types";

export default class BaseCommand implements ICommand {
  protected graph: Graph;
  protected target: INode;

  name = "_base";
  shortcuts = [];

  transactions: [Transaction[], Transaction[]] = [[], []];

  constructor(graph: Graph) {
    this.graph = graph;
    const node = this.graph.getCurrentNode();
    this.target = node;
  }

  init(_params?: any) {}

  canUndo() {
    return true;
  }

  shouldExecute() {
    return true;
  }

  canExecute(): boolean {
    return !!this.target;
  }

  execute(): Transaction[] {
    return this.transactions[0];
  }

  undo(): Transaction[] {
    return this.transactions[1];
  }

  select(item: INode = this.target) {
    setTimeout(() => {
      this.graph.setSelectedItems([item]);
    });
  }
}
