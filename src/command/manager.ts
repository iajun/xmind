import { ICommand, Transaction, TransactionType } from "./../types";
import Graph from "../graph";
import { EditorEvent, GraphCommonEvent, ItemState } from "../constants";
import _ from "lodash";
import { getParentId, getPrevId, isFired } from "../utils";
import BaseCommand from "./base";
import Queue from "./queue";
import { CommandOption } from ".";

class CommandManager {
  command: {
    [propName: string]: ICommand;
  };
  queue: Queue<BaseCommand> = new Queue();
  private graph: Graph;
  private el: HTMLElement;
  private editorFocused = false;
  private options: Record<string, CommandOption> = {};

  constructor(
    graph: Graph,
    commands: Record<string, ICommand> = {},
    commandOptions: CommandOption[] = []
  ) {
    this.graph = graph;
    this.command = commands || {};
    this.options = commandOptions.reduce((acc, item) => {
      acc[item.name] = item;
      return acc;
    }, {});
    this.bind();
  }

  register(command: ICommand) {
    this.command[command.name] = command;
  }

  setWrapper(el: HTMLElement) {
    this.el = el;
  }

  disable() {
    this.editorFocused = false;
  }

  enable() {
    this.editorFocused = true;
  }

  handleTransactions(transactions: Transaction[]) {
    const graph = this.graph;

    graph.executeBatch(() => {
      transactions.forEach(transaction => {
        const {
          command,
          payload: { model, pointer }
        } = transaction;
        switch (command) {
          case TransactionType.REMOVE:
            const node = graph.findById(model.id);
            const nextSelectedNode = getPrevId(node) || getParentId(node)
            graph.removeChild(model.id);
            graph.selectNode(nextSelectedNode);
            break;
          case TransactionType.ADD:
            graph.placeNode(model, pointer);
            graph.selectNode(model.id);
            break;
          case TransactionType.UPDATE:
            graph.updateItem(model.id, model);
            break;
        }
      });
    });
    graph.layout();
  }
  canExecute(name: string): BaseCommand | false {
    const Command = this.command[name];
    if (!Command) {
      return false;
    }
    const Ctor = Command.constructor;
    const command = new (Ctor as any)(this.graph, this.queue);
    if (!command.canExecute()) {
      return false;
    }
    if (this.options[name] && this.options[name].shouldExecute) {
      command.shouldExecute = this.options[name].shouldExecute.bind(command);
    }
    if (!command.shouldExecute()) return false;
    return command;
  }
  /** 执行命令 */
  execute(name: string, params?: object) {
    const command = this.canExecute(name)
    if (!command) return;

    command.init(params);


    const transactions = command.execute();

    this.graph.emit(EditorEvent.onBeforeExecuteCommand, command, transactions);
    this.handleTransactions(transactions);
    this.graph.emit(EditorEvent.onAfterExecuteCommand, command, transactions);


    this.enable();

    if (command.canUndo()) {
      this.queue.push(command);
    }
  }

  private shouldTriggerShortcut(): Boolean {
    return this.editorFocused || !this.graph.isEditing;
  }

  get container() {
    return this.el || this.graph.get("container");
  }

  private mousedownListener(e: MouseEvent) {
    let parentNode = (e.target as any).parentNode;
    while (parentNode && parentNode.nodeName !== "BODY") {
      if (parentNode === this.container) {
        this.editorFocused = true;
        return;
      } else {
        parentNode = parentNode.parentNode;
      }
    }
    this.editorFocused = false;
  }

  private bind() {
    const mousedownListener = this.mousedownListener.bind(this);

    window.addEventListener(GraphCommonEvent.onMouseDown, mousedownListener);

    this.graph.on(EditorEvent.onBeforeDestroy, () => {
      window.removeEventListener(
        GraphCommonEvent.onMouseDown,
        mousedownListener
      );
    });

    this.graph.on(GraphCommonEvent.onKeyDown, e => {
      if (!this.shouldTriggerShortcut()) return;
      // editing
      if (this.graph.findAllByState("node", ItemState.Editing).length) return;

      Object.values(this.command).some(command => {
        const { name, shortcuts } = command;

        if (isFired(shortcuts, e)) {
          e.preventDefault();

          this.execute(name);

          return true;
        }

        return false;
      });
    });
  }
}

export default CommandManager;
